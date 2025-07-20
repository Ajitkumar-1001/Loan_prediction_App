from pydantic import BaseModel 
from typing import Optional 


class Feedback(BaseModel):
    name: str
    email: str
    message: str
    