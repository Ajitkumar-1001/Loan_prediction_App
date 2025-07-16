from fastapi import APIRouter, HTTPException


from loan_api.models.loan_approval import LoanApproval
from joblib import load 
import numpy as np 

router = APIRouter(prefix="/Loan" , tags=["LoanApproval"])

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
        

        return {
            "Loan Approval Status": "Approved" if prediction == 1 else "Not Approved"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))