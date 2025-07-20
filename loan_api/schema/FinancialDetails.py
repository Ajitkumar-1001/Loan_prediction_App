from pydantic import BaseModel 
from typing import Optional 

class FinancialDetails(BaseModel): 
    FinancialID : Optional[int] = None 
    ApplicantID : int 
    AnnualIncome : Optional[int] = None 
    MonthlyIncome : Optional[float] = None 
    SavingsAccountBalance  : Optional[int] = None 
    CheckingAccountBalance :  Optional[int] = None 
    TotalAssets : Optional[int] = None 
    TotalLiabilities : Optional[int] = None 
    Networth : Optional[int] = None 
    DebtToIncomeRatio : Optional[float] = None 
    TotalDebtToIncomeRatio : Optional[float] = None
    


