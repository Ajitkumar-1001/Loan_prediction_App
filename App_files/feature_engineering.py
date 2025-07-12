from copy import copy 

def feature_engineered(df):
    df = df.copy() 
    df["IncomePerDependent"] = df["MonthlyIncome"] / (df["NumberOfDependents"] + 1)
    df["AssetToLiabilityRatio"] = df["TotalAssets"] / (df["TotalLiabilities"] + 1)
    df["LoanToIncomeRatio"] = df["LoanAmount"] / (df["AnnualIncome"] + 1)
    df["CreditHistoryLengthPerAge"] = df["LengthOfCreditHistory"] / (df["Age"] + 1)

    return df 
