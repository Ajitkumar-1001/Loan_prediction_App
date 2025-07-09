from pydantic import BaseModel 
from datetime import date 
from typing import Optional

class Applicant(BaseModel):

    ApplicantID : Optional[int] = None
    ApplicationDate : date
    Age : int 
    MaritalStatus : str 
    NumberofDependents : int 
    HomeOwnershioStatus : str 




