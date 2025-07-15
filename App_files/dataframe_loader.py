import pandas as pd 
import numpy as np 
import csv
from pathlib import Path 
import sys 
sys.path.append(str(Path(__file__).resolve().parent.parent))
from App_files.data_utils import (create_connection,create_table,execute_sql_statement,insert_data,fetch_data_from_db,load_and_normalizedata)
import sqlite3

from App_files.queries import (create_applicants_table, create_credit_history_table,create_employment_details_table,create_financial_details_table,create_loan_details_table,join_query) 
from App_files.queries import( insert_applicant_query,insert_credit_history_query,insert_employment_details_query,insert_financial_query,insert_loan_data_query)
from config.config import logger


db_file = Path(__file__).resolve().parent.parent / "data" / "LoanDATABASE.db"

csv_file = Path(__file__).resolve().parent.parent / "data" / "Loan.csv"


def df_loader():

    

    assert str(csv_file).endswith(".csv")

    logger.info("Creating Connection to the database")
    conn = create_connection(db_file, delete_db=True)
    if conn is None:
        return
    logger.info("Connection created successfully")

    logger.info("Creating tables")
    create_table(conn, create_applicants_table)
    create_table(conn, create_financial_details_table)
    create_table(conn, create_credit_history_table)
    create_table(conn, create_employment_details_table)
    create_table(conn, create_loan_details_table)

    logger.info("Tables created successfully")


    logger.info("Loading the database and Normalizing for a 3NF..")
    applicants_data, financial_data, credit_history_data, employment_data, loan_data = load_and_normalizedata(csv_file, conn)

    logger.info("Normalization done !.")
    logger.info("Inserting data to the tables")

    insert_data(conn, insert_applicant_query, applicants_data)

    insert_data(conn, insert_financial_query, financial_data)

    insert_data(conn,insert_credit_history_query, credit_history_data)

    insert_data(conn, insert_employment_details_query, employment_data)

    insert_data(conn, insert_loan_data_query, loan_data)

    logger.info("All data inserted successfully")

    conn = sqlite3.connect(db_file)

    df = fetch_data_from_db(conn,join_query)
  
    conn.commit()
    conn.close()

    logger.info("🧹 Tables created, data inserted, and DB connection closed.")

    return df


if __name__ == "__main__":
    logger.info("🚀 Running df_loader from main block")
    df = df_loader()
    logger.info("✅ df_loader completed")