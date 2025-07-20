from fastapi import APIRouter, HTTPException
import google.generativeai as genai  # type: ignore
import os
from pathlib import Path
from loan_api.schema.loan_approval import LoanApproval
from joblib import load
import numpy as np
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Get Gemini API key and configure
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)

# Load your model
model = load("/Users/ajit/Desktop/loan_predictor_app/ModelFiles/final_loan_approval_model.pkl")

# Define the router
router = APIRouter(prefix="/Loan", tags=["LoanApproval"])


@router.post("/predict-loan")
async def predict(loandet: LoanApproval):
    try:
        # Prepare input
        values = np.array([[
            loandet.IncomePerDependent,
            loandet.LoanAmount,
            loandet.RiskScore,
            loandet.TotalDebtToIncomeRatio,
            loandet.InterestRate,
            loandet.AnnualIncome,
            loandet.BaseInterestRate
        ]])

        # Get prediction
        prediction = model.predict(values)[0]
        status = "Approved" if prediction == 1 else "Not Approved"

        # Construct LLM prompt based on result
        if status == "Approved":
            prompt = (
                f"The loan has been approved for the applicant with Annual Income = {loandet.AnnualIncome}, "
                f"Loan Amount = {loandet.LoanAmount}, and Risk Score = {loandet.RiskScore}.\n"
                f"Suggest 3 short and professional tips to maintain a good credit profile and ensure future loan eligibility. and you are an bank assistant provide report on why the loan got approved"
            )
        else:
            prompt = (
                f"The loan has been rejected for the applicant with Annual Income = {loandet.AnnualIncome}, "
                f"Loan Amount = {loandet.LoanAmount}, and Risk Score = {loandet.RiskScore}.\n"
                f"As a Bank assistant Give 3 short and bank professional helpful tips to improve creditworthiness and increase chances of future loan approval and motivate the customer to cheer up by 2 quick and short suggestion. and provide a para on why loan got rejected"
            )

        # Call Gemini
        gen_model = genai.GenerativeModel("gemini-2.5-flash") 
        response = gen_model.generate_content(prompt)
        gen_text = response.text if hasattr(response, "text") else "LLM did not return any text."

        return {
            "prediction": status,
            "message": f"Loan is likely to be {status}. Please wait for the Automated intelligence suggestions",
            "llm_response": gen_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction or LLM failed: {str(e)}")
