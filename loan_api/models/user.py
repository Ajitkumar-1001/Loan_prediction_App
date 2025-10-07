from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base #ignoretype : any

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key= True, index=True)
    firstname = Column(String, unique=False, index=True,nullable=False)
    middlename = Column(String, unique = False, nullable=True)
    lastname = Column(String, unique = False, nullable=False)
    email = Column(String,unique=True,nullable=False)
    password = Column(String, nullable=False)
    role = Column(String,default="user")

    # Relationship to uploaded documents
    uploaded_documents = relationship("Document", back_populates="uploader")



