import os
from dotenv import load_dotenv
import pandas as pd
from supabase import Client, create_client


def querySupabase() -> pd.DataFrame:
  '''
  Queries the Supabase database for text responses and returns the data as a pandas DataFrame.

  :return: A pandas DataFrame containing the text responses.
  :rtype: pd.DataFrame

  :raises ValueError: If the Supabase URL or key is not found in the environment variables.
  '''

  # Load environment variables from .env file
  load_dotenv()
  url: str = os.environ.get("SUPABASE_URL", "")
  key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

  if url == "" or key == "":
    raise ValueError("Supabase URL or key not found in environment variables.")

  supabase: Client = create_client(url, key)

  # queries are limited to 1000 rows
  response = (
      supabase.schema("trainingdata")
      .table("text_responses")
      .select("*", count="exact")
      .execute()
  )

  count = response.count
  df = pd.DataFrame(response.data)

  # loop until all rows are loaded
  while len(df) < count:
    response = (
        supabase.schema("trainingdata")
        .table("text_responses")
        .select("*")
        .range(len(df), len(df) + 1000)
        .execute()
    )
    df = pd.concat([df, pd.DataFrame(response.data)])

  print(f'Loaded {len(df)} rows out of {count}')

  return df
