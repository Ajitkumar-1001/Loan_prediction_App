from pydantic import BaseModel 
from typing import Optional 


class EmploymentDetails(BaseModel):
    EmploymentID : Optional[int] = None 
    ApplicantId : int 
    EmploymentStatus : str 
    EducationLevel : str 
    Experience : Optional[int] = None 
    JobTenure : Optional[int] = None 

    
