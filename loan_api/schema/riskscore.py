from pydantic import BaseModel 
from typing import Optional


class RiskScore(BaseModel): 
    MonthlyIncome: Optional[int] = None
    AnnualIncome :Optional[int]  = None           
    SavingsAccountBalance:  Optional[int] = None 
    NetWorth           :    Optional[int] = None 
    BankruptcyHistory      :  Optional[int] = None 
    PreviousLoanDefaults   :  Optional[int] = None 
    TotalAssets            : Optional[int] = None 
    TotalLiabilities      :  Optional[int] = None 