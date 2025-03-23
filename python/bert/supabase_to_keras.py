'''
Converts the supabase dataset to a keras dataset.
'''

import os
import sys

import pandas as pd

from dotenv import load_dotenv
from supabase import Client, create_client
from csv_to_keras import exportKerasFolder


def main(argv: list[str]) -> None:
  '''
  Converts the supabase dataset to a keras dataset.
  '''

  # Check if the correct number of arguments is provided
  if len(argv) != 3:
    print("Usage: python supabase_to_keras.py <dataset_name> <training_split>")
    sys.exit(1)
  dataset_name = argv[1]

  if not dataset_name:
    raise ValueError("Dataset name cannot be empty.")

  training_split = float(argv[2])

  if not 0 <= training_split <= 1:
    raise ValueError("Training split must be between 0 and 1.")

  # Load environment variables from .env file
  load_dotenv()

  url: str = os.environ.get("SUPABASE_URL", "")
  key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

  if url == "" or key == "":
    raise ValueError("Supabase URL or key not found in environment variables.")

  supabase: Client = create_client(url, key)

  response = supabase.schema("trainingdata")   \
                     .table("text_responses")  \
                     .select("*")              \
                     .execute()

  df = pd.DataFrame(response.data)

  print(df)

  # keras_directory = os.path.join(os.getcwd(), 'data', 'keras', f'{dataset_name}-{training_split}')
  # exportKerasFolder(df, keras_directory, training_split=training_split)


if __name__ == "__main__":
  main(sys.argv)
