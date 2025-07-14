
create_applicants_table = """
CREATE TABLE Applicants (
ApplicantID INTEGER PRIMARY KEY AUTOINCREMENT,
ApplicationDate DATE NOT NULL,
Age INT NOT NULL,
MaritalStatus VARCHAR(20),
NumberOfDependents INT,
HomeOwnershipStatus VARCHAR(50)
);
"""

create_financial_details_table = """
CREATE TABLE FinancialDetails (
FinancialID INTEGER PRIMARY KEY AUTOINCREMENT,
ApplicantID INT NOT NULL,
AnnualIncome INT,
MonthlyIncome FLOAT,
SavingsAccountBalance INT,
CheckingAccountBalance INT,
TotalAssets INT,
TotalLiabilities INT,
NetWorth INT,
DebtToIncomeRatio FLOAT,
TotalDebtToIncomeRatio FLOAT,
FOREIGN KEY (ApplicantID) REFERENCES Applicants(ApplicantID)
);
"""

create_credit_history_table = """
CREATE TABLE CreditHistory (
CreditHistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
ApplicantID INT NOT NULL,
CreditScore INT,
PaymentHistory INT,
NumberOfOpenCreditLines INT,
NumberOfCreditInquiries INT,
CreditCardUtilizationRate FLOAT,
BankruptcyHistory INT,
PreviousLoanDefaults INT,
UtilityBillsPaymentHistory FLOAT,
LengthOfCreditHistory INT,
FOREIGN KEY (ApplicantID) REFERENCES Applicants(ApplicantID)
);
"""

create_employment_details_table = """
CREATE TABLE EmploymentDetails (
EmploymentID INTEGER PRIMARY KEY AUTOINCREMENT,
ApplicantID INT NOT NULL,
EmploymentStatus VARCHAR(50),
EducationLevel VARCHAR(50),
Experience INT,
JobTenure INT,
FOREIGN KEY (ApplicantID) REFERENCES Applicants(ApplicantID)
);
"""

create_loan_details_table = """
CREATE TABLE LoanDetails (
LoanID INTEGER PRIMARY KEY AUTOINCREMENT,
ApplicantID INT NOT NULL,
LoanAmount INT,
LoanDuration INT,
LoanPurpose VARCHAR(100),
MonthlyLoanPayment FLOAT,
BaseInterestRate FLOAT,
InterestRate FLOAT,
LoanApproved BOOLEAN,
RiskScore FLOAT,
FOREIGN KEY (ApplicantID) REFERENCES Applicants(ApplicantID)
);
"""

join_query = """
    SELECT
        A.ApplicantID, A.ApplicationDate, A.Age, A.MaritalStatus, A.NumberOfDependents, A.HomeOwnershipStatus,
        F.AnnualIncome, F.MonthlyIncome, F.SavingsAccountBalance, F.CheckingAccountBalance,
        F.TotalAssets, F.TotalLiabilities, F.NetWorth, F.DebtToIncomeRatio, F.TotalDebtToIncomeRatio,
        C.CreditScore, C.PaymentHistory, C.NumberOfOpenCreditLines, C.NumberOfCreditInquiries,
        C.CreditCardUtilizationRate, C.BankruptcyHistory, C.PreviousLoanDefaults, C.UtilityBillsPaymentHistory,
        C.LengthOfCreditHistory,
        E.EmploymentStatus, E.EducationLevel, E.Experience, E.JobTenure,
        L.LoanAmount, L.LoanDuration, L.LoanPurpose, L.MonthlyLoanPayment, L.BaseInterestRate,
        L.InterestRate, L.LoanApproved, L.RiskScore
    FROM Applicants A
    LEFT JOIN FinancialDetails F ON A.ApplicantID = F.ApplicantID
    LEFT JOIN CreditHistory C ON A.ApplicantID = C.ApplicantID
    LEFT JOIN EmploymentDetails E ON A.ApplicantID = E.ApplicantID
    LEFT JOIN LoanDetails L ON A.ApplicantID = L.ApplicantID;
    """


insert_financial_query = """
    INSERT INTO FinancialDetails (ApplicantID, AnnualIncome, MonthlyIncome, SavingsAccountBalance, CheckingAccountBalance,
    TotalAssets, TotalLiabilities, NetWorth, DebtToIncomeRatio, TotalDebtToIncomeRatio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """

insert_applicant_query = """
    INSERT INTO Applicants (ApplicationDate, Age, MaritalStatus, NumberOfDependents, HomeOwnershipStatus)
    VALUES (?, ?, ?, ?, ?);
    """

insert_credit_history_query =  """
    INSERT INTO CreditHistory (ApplicantID, CreditScore, PaymentHistory, NumberOfOpenCreditLines, NumberOfCreditInquiries,
    CreditCardUtilizationRate, BankruptcyHistory, PreviousLoanDefaults, UtilityBillsPaymentHistory,
    LengthOfCreditHistory)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """

insert_employment_details_query = """
    INSERT INTO EmploymentDetails (ApplicantID, EmploymentStatus, EducationLevel, Experience, JobTenure)
    VALUES (?, ?, ?, ?, ?);
    """

insert_loan_data_query = """
    INSERT INTO LoanDetails (ApplicantID, LoanAmount, LoanDuration, LoanPurpose, MonthlyLoanPayment, BaseInterestRate,
    InterestRate, LoanApproved, RiskScore)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """

