import sqlite3
import os
import pandas as pd 
import pathlib as Path 


db_path = Path(__file__).resolve().parent.parent / "data" / "LoanDATABASE.db"

# if db_path.exists(): 
#     try: 
        