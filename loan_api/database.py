import sqlite3
from dotenv import loan_dotenv()
from pathlib import Path
import os 


var = loan_dotenv()

database_path = os.getenv("DATABASE_PATH")


if database_path: 
    print(f"Database Exists!")
else:
    print("Error cannot find Database")


def get_connection(): 
    conn = sqlite3.connect(database_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign keys = 1")
    return conn 