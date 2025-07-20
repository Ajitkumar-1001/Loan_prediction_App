import sqlite3
from dotenv import load_dotenv
from pathlib import Path
import os 
import sys 
sys.path.append(str(Path().resolve().parent))
# sys.path.append(str(Path(__file__).resolve().parent / 'config' /'config.yaml'))
from App_files.queries import join_query
from config.config import logger
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker



var = load_dotenv()

database_path = os.getenv("DATABASE_PATH")


if database_path: 
    logger.info("Database exists and ready for further process")
else:
    logger.error("Database not found, Check for the path or the saved destination in before files")

@contextmanager
def get_connection(): 
    conn = sqlite3.connect(database_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn 
    finally:
        conn.close()
    

def return_vals():
    try:

        with get_connection() as conn: 
            cur = conn.cursor()
            query = join_query 
            cur.execute(query)
            rows = cur.fetchall() 
            return rows 
    except Exception as e:
        raise ValueError(str(e))


DATABASE_URL = "sqlite:////Users/ajit/Desktop/loan_predictor_app/data/LoanDATABASE.db"


engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} 
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base = declarative_base()



if __name__ == "__main__":
    logger.info("Executing the database api file")
    val = return_vals()
    
    if val:
        logger.info("Successfully fetched !")
    else:
        logger.error("There is an error in fetching values")
    
    