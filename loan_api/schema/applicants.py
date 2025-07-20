from pydantic import BaseModel 
from datetime import date 
from typing import Optional


class Applicants(BaseModel):


    ApplicantID : Optional[int] = None
    ApplicationDate : date
    Age : int 
    MaritalStatus : str 
    NumberOfDependents : int 
    HomeOwnershioStatus : str 




