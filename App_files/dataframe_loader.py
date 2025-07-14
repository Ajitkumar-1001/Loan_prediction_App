import sqlite3
import os
import pandas as pd 
import pathlib as Path 
from App_files.data_loader import load_file
import csv




def create_connection(db_file, delete_db = False):

    assert str(db_file).endswith(".db")

    if db_file.exists() and delete_db: 
        try: 
            os.remove(db_file)
            print(f"Removed exisiting database {db_file}")

        except Exception as e:
            raise ValueError(str(e))
        
    try: 
       
        conn = sqlite3.connect(db_file)
        conn.execute("PRAGMA foreign_keys = 1")
        print(f"Connected to database: {db_file}")
        return conn
    
    except sqlite3.Error as e:

        print(f"Error connecting to database: {e}")
        return None


def create_table(conn, create_table_sql):

    try:
        c = conn.cursor()
        c.execute(create_table_sql)
        print("Table created successfully.")
    except sqlite3.Error as e:
        print(f"Error creating table: {e}")


def execute_sql_statement(sql_statement, conn, parameters=()):
    try:
        cur = conn.cursor()
        cur.execute(sql_statement, parameters)
        return cur.fetchall()
    except sqlite3.Error as e:
        print(f"Error executing SQL statement: {e}")
        return None
    
def insert_data(conn, query, data):
    try:
        cur = conn.cursor()
        cur.executemany(query, data)
        conn.commit()
        print("Data inserted successfully.")
    except sqlite3.Error as e:
        print(f"Error inserting data: {e}")
       

def fetch_data_from_db(conn, query):
    try:
        df = pd.read_sql_query(query, conn)
        return df
    except Exception as e:
        print(f"Error: {e}")
        return pd.DataFrame()
    

def load_and_normalizedata(csv_file, conn):

    assert str(csv_file).endswith(".csv")
    
    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        headers = next(reader)  

        # Normalized data lists
        applicants_data = []
        financial_data = []
        credit_history_data = []
        employment_data = []
        loan_data = []

        applicant_id = 1  
       
        for row in reader:
            if '?' in row or '' in row:
                continue  

          
            applicants_data.append((row[0], int(row[1]), row[9], int(row[10]), row[11]))  
            financial_data.append((applicant_id, int(row[2]), float(row[26]), int(row[22]), int(row[23]),
                                   int(row[24]), int(row[25]), int(row[29]), float(row[16]), float(row[33])))
            credit_history_data.append((applicant_id, int(row[3]), int(row[20]), int(row[14]), int(row[15]),
                                        float(row[13]), int(row[17]), int(row[19]), float(row[27]), int(row[21])))
            employment_data.append((applicant_id, row[4], row[5], int(row[6]), int(row[28])))  
            loan_data.append((applicant_id, int(row[7]), int(row[8]), row[18], float(row[32]), float(row[30]),
                              float(row[31]), int(row[34]), float(row[35])))

            applicant_id += 1

    return applicants_data, financial_data, credit_history_data, employment_data, loan_data