import sqlite3
from dotenv import load_dotenv
from pathlib import Path
import os 
import sys 
sys.path.append(str(Path().resolve().parent))
from App_files.queries import join_query
from config.config import logger

var = load_dotenv()

database_path = os.getenv("DATABASE_PATH")


if database_path: 
    logger.info("Database exists and ready for further process")
else:
    logger.error("Database not found, Check for the path or the saved destination in before files")


def get_connection(): 
    conn = sqlite3.connect(database_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn 

def return_vals():
    conn = get_connection()
    cursor = conn.cursor() 

    try: 
        query = join_query
        cursor.execute(query)
        rows = cursor.fetchall()

        return rows
    
    except Exception as e:
        raise ValueError(str(e))
    

if __name__ == "__main__":
    logger.info("Executing the database api file")
    val = return_vals()
    
    if val:
        logger.info("Successfully fetched !")
    else:
        logger.error("There is an error in fetching values")
    
    