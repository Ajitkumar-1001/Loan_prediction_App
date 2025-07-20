from pydantic import BaseModel 
from typing import Optional 

class CreditHistory(BaseModel): 
    CreditHistoryId: Optional[int] = None 
    ApplicantId : int 
    CreditScore : Optional[int] = None
    PaymentHistory : Optional[int] = None
    NumberofOpenCreditLines : Optional[int] = None
    NumberofCreditInquiries : Optional[int] = None
    CreditCardUtilizationRate : Optional[float] = None
    BankruptcyHistory : Optional[int] = None
    PreviousLoanDefaults : Optional[int] = None
    UtilityBillsPaymentHistory  : Optional[float] = None
    LengthOfCreditHistory : Optional[int]  = None

