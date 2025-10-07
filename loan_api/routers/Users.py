import sys
from pathlib import Path
sys.path.append(str(Path().resolve().parent))

from fastapi import APIRouter, HTTPException, Depends
from schema.users import CreateUser,Users, UserLogin
from models.user import User
from authenticate import hash_password,verify_password,create_access_token
from sqlalchemy.orm import Session
from database import SessionLocal
from fastapi import Request
from redis_client import redis_client, CacheKeys, CacheTTL

def get_db():   
    db = SessionLocal()
    try: 
        yield db 
   
    finally : 
        db.close()




rout = APIRouter(prefix='/user' )

@rout.post("/signup", response_model=Users)
async def get_usersignup(user: CreateUser, request: Request, db: Session = Depends(get_db)):

    query = db.query(User)
    if query.filter(User.email == user.email).first():
        raise HTTPException(status_code=401, detail="Email already registered")

    new_user = User(
        firstname=user.firstname,
        middlename=user.middlename,
        lastname=user.lastname,
        email=user.email,
        password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(await request.body())

    return Users(
        firstname=new_user.firstname,
        middlename=new_user.middlename,
        lastname=new_user.lastname,
        email=new_user.email,
        role=new_user.role,
        isAdmin= (new_user.role == "admin") 
)

@rout.post("/login")
async def get_loginuser(user: UserLogin,request:Request, db: Session = Depends(get_db)):
    # Try cache first for user lookup
    cache_key = CacheKeys.user(user.email)
    cached_user = redis_client.get(cache_key)

    if cached_user:
        # User found in cache
        if not verify_password(user.password, cached_user["password"]):
            raise HTTPException(status_code=400, detail="User Email not found or password mismatch")
        condition_data = cached_user
    else:
        # Cache miss - query database
        query = db.query(User)
        condition = query.filter(User.email == user.email).first()

        if not condition or not verify_password(user.password, condition.password):
            raise HTTPException(status_code=400, detail="User Email not found or password mismatch")

        # Cache user data
        condition_data = {
            "email": condition.email,
            "password": condition.password,
            "role": condition.role,
            "firstname": condition.firstname
        }
        redis_client.set(cache_key, condition_data, CacheTTL.USER)

    token = create_access_token(data={"sub": user.email})

    print(await request.body())

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": condition_data["role"],
        "first_name": condition_data["firstname"]
    }
    
