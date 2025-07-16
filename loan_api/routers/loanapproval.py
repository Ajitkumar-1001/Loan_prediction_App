from fastapi import APIRouter, HTTPException
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from models.Loan_approval import LoanApproval
from joblib import load 
import numpy as np 

router = APIRouter(prefix="/Loan" , tags=[LoanApproval])

model = load("/Users/ajit/Desktop/loan_predictor_app/ModelFiles/final_loan_approval_model.pkl")

@router.post("/predict-loan")
def predict(loandet : LoanApproval):

    values = np.array([[
        loandet.IncomePerDependent,
        loandet.LoanAmount,
        loandet.RiskScore,
        loandet.TotalDebtToIncomeRatio,
        loandet.InterestRate,
        loandet.AnnualIncome,
        loandet.BaseInterestRate
    ]])

    try:
        prediction = model.predict(values)[0]
        predict_probability = model.predict_proba(values)[0][prediction]

        return {
            "Loan Approval Status": "Approved" if prediction == 1 else "Not Approved",
            "Confidence": f"{predict_probability:.2%}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))