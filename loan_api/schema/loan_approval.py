from pydantic import BaseModel 
from typing import Optional 


class LoanApproval(BaseModel):
    IncomePerDependent : float
    LoanAmount : int 
    RiskScore	: float
    TotalDebtToIncomeRatio :float
    InterestRate	: float
    AnnualIncome	: int 
    BaseInterestRate :float 

