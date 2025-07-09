from pydantic import BaseModel 
from typing import Optional 


class LoanDetails(BaseModel): 

    LoanID : Optional[int] = None 
    ApplicantID : Optional[int] = None 
    LoanAmount : int 
    LoanDuration : Optional[int] = None 
    LoanPurpose : Optional[str] = None 
    MonthlyLoanPayment : Optional[float] = None 
    BaseInterestRate : Optional[float] = None
    InterestRate : Optional[float] = None 
    LoanApproved : bool 
    RiskScore : Optional[float] = None