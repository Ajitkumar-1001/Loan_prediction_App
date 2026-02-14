from typing import Optional
from pydantic import BaseModel, Field


class LoanApproval(BaseModel):
    IncomePerDependent: float = Field(gt=0)
    LoanAmount: float = Field(gt=0)
    RiskScore: Optional[float] = Field(default=None, gt=0)
    TotalDebtToIncomeRatio: float = Field(gt=0)
    InterestRate: float = Field(gt=0)
    AnnualIncome: float = Field(gt=0)
    BaseInterestRate: float = Field(gt=0)

    # Optional fields used for automatic RiskScore generation when RiskScore is omitted.
    MonthlyIncome: Optional[float] = Field(default=None, gt=0)
    SavingsAccountBalance: Optional[float] = Field(default=None, ge=0)
    NetWorth: Optional[float] = None
    BankruptcyHistory: Optional[int] = Field(default=None, ge=0)
    PreviousLoanDefaults: Optional[int] = Field(default=None, ge=0)
    TotalAssets: Optional[float] = Field(default=None, ge=0)
    TotalLiabilities: Optional[float] = Field(default=None, ge=0)
    CreditScore: Optional[float] = Field(default=None, ge=300, le=850)
