import pandas as pd 
import numpy as np 
import csv
from pathlib import Path 
from App_files.data_utils import (create_connection,create_table,execute_sql_statement,insert_data,fetch_data_from_db,load_and_normalizedata)
import sqlite3
from App_files.queries import (create_applicants_table, create_credit_history_table,create_employment_details_table,create_financial_details_table,create_loan_details_table,join_query) 
from App_files.queries import( insert_applicant_query,insert_credit_history_query,insert_employment_details_query,insert_financial_query,insert_loan_data_query)


db_file = "/Users/ajit/Desktop/loan_predictor_app/data/LoanDATABASE.db"
csv_file = Path(__file__).resolve().parent.parent / "data" / "Loan.csv"


def df_loader():

    assert str(csv_file).endswith(".csv")
    
    conn = create_connection(db_file, delete_db=True)
    if conn is None:
        return

    create_table(conn, create_applicants_table)
    create_table(conn, create_financial_details_table)
    create_table(conn, create_credit_history_table)
    create_table(conn, create_employment_details_table)
    create_table(conn, create_loan_details_table)

    applicants_data, financial_data, credit_history_data, employment_data, loan_data = load_and_normalizedata(csv_file, conn)


    insert_data(conn, insert_applicant_query, applicants_data)

    insert_data(conn, insert_applicant_query, financial_data)

    insert_data(conn,insert_credit_history_query, credit_history_data)

    insert_data(conn, insert_employment_details_query, employment_data)

    insert_data(conn, insert_loan_data_query, loan_data)

    conn = sqlite3.connect(db_file)

    df = fetch_data_from_db(conn,join_query)
  
    conn.commit()
    conn.close()

    print("Tables created, data inserted, and connection closed.")

    return df