"""
This module fetches data from a Supabase database and exports it to a CSV file.

The main function loads environment variables, connects to the Supabase database, fetches data from
specified tables, and exports the data to CSV files.

Functions:
  main() -> None: Main function that orchestrates the data fetching and exporting process.
  fetchData(supabase: Client, table: str): Fetches all data from a specified table in the Supabase 
  database.
"""

import os
import re

import pandas as pd
from dotenv import load_dotenv
from supabase import Client, create_client


def main() -> None:
  """main function"""
  # Load environment variables from .env file
  load_dotenv()

  url: str = os.environ.get("SUPABASE_URL")
  key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
  supabase: Client = create_client(url, key)

  response = supabase.schema("public")              \
                     .table("epa_kf_descriptions")  \
                     .select("kf_descriptions")     \
                     .single().execute()

  kf_descriptions = response.data["kf_descriptions"]
  table_names = ['mcq_kf' + re.sub(r'\.', '_', kf)
                 for kf in [*kf_descriptions.keys()]]

  data = fetchData(supabase, table_names[0])
  # export data to csv
  df = pd.DataFrame(data)
  df.to_csv(f"data/{table_names[0]}.csv", index=False)


def fetchData(supabase: Client, table: str):
  """
  This Python function fetches all data from a specified table in a Supabase
  database.

  :param supabase: The `supabase` parameter is an instance of the Supabase client
  that is used to interact with the Supabase database. It allows you to perform
  operations such as querying data, inserting data, updating data, and deleting
  data from your database
  :type supabase: Client
  :param table: The `table` parameter in the `fetchData` function is a string that
  represents the name of the table from which you want to fetch data
  :type table: str
  :return: The function `fetchData` is returning the data fetched from the
  Supabase database table specified by the `table` parameter.
  """
  response = supabase.schema("trainingdata").table(table).select("*").execute()
  return response.data


if __name__ == "__main__":
  main()
