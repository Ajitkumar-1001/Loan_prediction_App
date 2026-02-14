from typing import Optional
from pydantic import BaseModel, Field


class RiskScore(BaseModel):
    MonthlyIncome: Optional[float] = None
    AnnualIncome: Optional[float] = None
    SavingsAccountBalance: Optional[float] = None
    NetWorth: Optional[float] = None
    BankruptcyHistory: Optional[int] = None
    PreviousLoanDefaults: Optional[int] = None
    TotalAssets: Optional[float] = None
    TotalLiabilities: Optional[float] = None
    CreditScore: Optional[float] = None


class RiskScoreCalculatorRequest(BaseModel):
    totalAssets: float = Field(gt=0)
    totalLiabilities: float = Field(ge=0)
    creditScore: Optional[float] = Field(default=None, ge=300, le=850)
    monthlyIncome: float = Field(gt=0)
    annualIncome: Optional[float] = Field(default=None, gt=0)
    savingsAccountBalance: Optional[float] = Field(default=None, ge=0)
    netWorth: Optional[float] = None
    bankruptcyHistory: Optional[int] = Field(default=None, ge=0)
    previousLoanDefaults: Optional[int] = Field(default=None, ge=0)


class RiskScoreCalculatorResponse(BaseModel):
    riskScore: float
    modelRiskScore: float
    annualIncomeUsed: float
    netWorthUsed: float
