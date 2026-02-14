import os
from pathlib import Path
from typing import Optional

import google.generativeai as genai  # type: ignore
import numpy as np
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from joblib import load
from pydantic import BaseModel, Field

from loan_api.schema.loan_approval import LoanApproval
from loan_api.schema.riskscore import RiskScoreCalculatorRequest, RiskScoreCalculatorResponse


# Load environment variables
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Gemini is optional for scoring endpoints. If key is missing, scoring still works.
api_key = os.getenv("GEMINI_API_KEY")
LLM_ENABLED = bool(api_key)
if LLM_ENABLED:
    genai.configure(api_key=api_key)

BASE_DIR = Path(__file__).resolve().parent
LOAN_MODEL_PATH = BASE_DIR.parent / "ModelFiles" / "final_loan_approval_model.pkl"
RISK_MODEL_PATH = BASE_DIR.parent / "ModelFiles" / "Final_riskscore_pred.pkl"

loan_model = load(LOAN_MODEL_PATH)
risk_model = load(RISK_MODEL_PATH)

# Define the router
router = APIRouter(prefix="/Loan", tags=["LoanApproval"])


# Pydantic models for calculator endpoints
class DebtToIncomeRequest(BaseModel):
    monthlyDebtPayments: float = Field(ge=0)
    monthlyIncome: float = Field(gt=0)


class DebtToIncomeResponse(BaseModel):
    totalDebtToIncomeRatio: float  # Value between 0 and 1


def _sigmoid(x: float) -> float:
    if x >= 0:
        z = np.exp(-x)
        return float(1 / (1 + z))
    z = np.exp(x)
    return float(z / (1 + z))


def _approval_probability(values: np.ndarray) -> float:
    if hasattr(loan_model, "predict_proba"):
        prob = float(loan_model.predict_proba(values)[0, 1])
        return float(np.clip(prob, 0.0, 1.0))

    if hasattr(loan_model, "decision_function"):
        raw = float(np.ravel(loan_model.decision_function(values))[0])
        return float(np.clip(_sigmoid(raw), 0.0, 1.0))

    pred = int(loan_model.predict(values)[0])
    return 0.85 if pred == 1 else 0.15


def _risk_inputs(
    *,
    monthly_income: float,
    total_assets: float,
    total_liabilities: float,
    annual_income: Optional[float] = None,
    savings_balance: Optional[float] = None,
    net_worth: Optional[float] = None,
    bankruptcy_history: Optional[int] = None,
    previous_defaults: Optional[int] = None,
    credit_score: Optional[float] = None,
) -> tuple[np.ndarray, float, float]:
    annual_income_used = annual_income if annual_income is not None else monthly_income * 12
    net_worth_used = net_worth if net_worth is not None else (total_assets - total_liabilities)
    savings_used = (
        savings_balance
        if savings_balance is not None
        else max(net_worth_used * 0.15, 0.0)
    )

    bankruptcy_used = (
        bankruptcy_history
        if bankruptcy_history is not None
        else (1 if credit_score is not None and credit_score < 520 else 0)
    )
    previous_defaults_used = (
        previous_defaults
        if previous_defaults is not None
        else (1 if credit_score is not None and credit_score < 600 else 0)
    )

    values = np.array(
        [[
            monthly_income,
            annual_income_used,
            savings_used,
            net_worth_used,
            bankruptcy_used,
            previous_defaults_used,
            total_assets,
            total_liabilities,
        ]]
    )
    return values, annual_income_used, net_worth_used


def _predict_risk_score(values: np.ndarray, credit_score: Optional[float]) -> tuple[float, float]:
    model_risk = float(risk_model.predict(values)[0])
    model_in_expected_band = 0 <= model_risk <= 100

    if credit_score is not None:
        # Convert credit score scale (300-850) to risk score scale (~25-85).
        credit_risk = float(np.interp(float(credit_score), [300, 850], [85, 25]))
        if model_in_expected_band:
            blended = (0.70 * model_risk) + (0.30 * credit_risk)
        else:
            blended = credit_risk
        risk_score = float(np.clip(blended, 0, 100))
    else:
        risk_score = float(np.clip(model_risk, 0, 100))

    return round(risk_score, 2), round(model_risk, 2)


def _llm_response(status: str, loandet: LoanApproval, risk_score: float) -> str:
    if not LLM_ENABLED:
        return "Scoring completed. LLM suggestion unavailable because GEMINI_API_KEY is not configured."

    if status == "Approved":
        prompt = (
            f"The loan has been approved for the applicant with Annual Income = {loandet.AnnualIncome}, "
            f"Loan Amount = {loandet.LoanAmount}, and Risk Score = {risk_score}.\n"
            f"With Risk Score = {risk_score} and Debt to Income = {loandet.TotalDebtToIncomeRatio}, "
            f"suggest the highest safe loan amount and provide 3 short professional tips to maintain credit health."
        )
    else:
        prompt = (
            f"The loan has been rejected for the applicant with Annual Income = {loandet.AnnualIncome}, "
            f"Loan Amount = {loandet.LoanAmount}, and Risk Score = {risk_score}.\n"
            "Provide 3 short bank-professional tips to improve creditworthiness and 2 brief motivational suggestions."
        )

    try:
        gen_model = genai.GenerativeModel("gemini-2.5-flash")
        response = gen_model.generate_content(prompt)
        return response.text if hasattr(response, "text") else "LLM did not return any text."
    except Exception:
        return "Scoring completed. LLM suggestion could not be generated at this time."


def _resolve_risk_score(loandet: LoanApproval) -> tuple[float, str]:
    if loandet.RiskScore is not None:
        return float(loandet.RiskScore), "provided"

    monthly_income = loandet.MonthlyIncome if loandet.MonthlyIncome is not None else loandet.AnnualIncome / 12
    if loandet.TotalAssets is None or loandet.TotalLiabilities is None:
        raise HTTPException(
            status_code=400,
            detail="RiskScore missing. Provide RiskScore or include TotalAssets and TotalLiabilities for automatic calculation.",
        )

    risk_values, _, _ = _risk_inputs(
        monthly_income=monthly_income,
        annual_income=loandet.AnnualIncome,
        savings_balance=loandet.SavingsAccountBalance,
        net_worth=loandet.NetWorth,
        bankruptcy_history=loandet.BankruptcyHistory,
        previous_defaults=loandet.PreviousLoanDefaults,
        total_assets=loandet.TotalAssets,
        total_liabilities=loandet.TotalLiabilities,
        credit_score=loandet.CreditScore,
    )
    risk_score, _ = _predict_risk_score(risk_values, loandet.CreditScore)
    return risk_score, "computed"


def _predict_loan(loandet: LoanApproval, *, include_llm: bool) -> dict:
    risk_score, risk_source = _resolve_risk_score(loandet)

    values = np.array(
        [[
            loandet.IncomePerDependent,
            loandet.LoanAmount,
            risk_score,
            loandet.TotalDebtToIncomeRatio,
            loandet.InterestRate,
            loandet.AnnualIncome,
            loandet.BaseInterestRate,
        ]]
    )

    prediction = int(loan_model.predict(values)[0])
    status = "Approved" if prediction == 1 else "Not Approved"
    approval_probability = _approval_probability(values)
    loan_score = round(approval_probability * 100, 2)

    response = {
        "prediction": status,
        "message": f"Loan is likely to be {status}.",
        "riskScoreUsed": round(risk_score, 2),
        "riskScoreSource": risk_source,
        "approvalProbability": round(approval_probability, 4),
        "loanScore": loan_score,
    }

    if include_llm:
        response["message"] = (
            f"Loan is likely to be {status}. Please wait for the automated intelligence suggestions."
        )
        response["llm_response"] = _llm_response(status=status, loandet=loandet, risk_score=risk_score)

    return response


@router.post("/predict-loan")
async def predict(loandet: LoanApproval):
    try:
        return _predict_loan(loandet, include_llm=True)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict-loan-auto")
async def predict_auto(loandet: LoanApproval):
    """
    Prediction endpoint without LLM dependency.
    Automatically computes RiskScore when missing and returns LoanScore.
    """
    try:
        return _predict_loan(loandet, include_llm=False)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto scoring failed: {str(e)}")


@router.post("/calculate-risk-score", response_model=RiskScoreCalculatorResponse)
async def calculate_risk_score(data: RiskScoreCalculatorRequest):
    """
    Calculate risk score from financial metrics using the trained risk model.
    """
    try:
        values, annual_income_used, net_worth_used = _risk_inputs(
            monthly_income=data.monthlyIncome,
            annual_income=data.annualIncome,
            savings_balance=data.savingsAccountBalance,
            net_worth=data.netWorth,
            bankruptcy_history=data.bankruptcyHistory,
            previous_defaults=data.previousLoanDefaults,
            total_assets=data.totalAssets,
            total_liabilities=data.totalLiabilities,
            credit_score=data.creditScore,
        )
        risk_score, model_risk = _predict_risk_score(values, data.creditScore)

        return RiskScoreCalculatorResponse(
            riskScore=risk_score,
            modelRiskScore=model_risk,
            annualIncomeUsed=round(annual_income_used, 2),
            netWorthUsed=round(net_worth_used, 2),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk score calculation failed: {str(e)}")


@router.post("/calculate-debt-to-income", response_model=DebtToIncomeResponse)
async def calculate_debt_to_income(data: DebtToIncomeRequest):
    """
    Calculate Total Debt to Income Ratio.
    Formula: total monthly debt payments / gross monthly income
    """
    try:
        ratio = data.monthlyDebtPayments / data.monthlyIncome
        return DebtToIncomeResponse(totalDebtToIncomeRatio=round(ratio, 4))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")
