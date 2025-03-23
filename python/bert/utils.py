import os
from dotenv import load_dotenv
import pandas as pd
from postgrest.types import CountMethod
from supabase import Client, create_client


def querySupabase(verbose: bool = False) -> pd.DataFrame:
  '''
  Queries the Supabase database for text responses and returns the data as a pandas DataFrame.

  :param verbose: If True, print verbose output. Defaults to False.
  :type verbose: bool

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

  if verbose:
    print("Querying Supabase database...")

  # queries are limited to 1000 rows
  response = (
      supabase.schema("trainingdata")
      .table("text_responses")
      .select("*", count=CountMethod.exact)
      .execute()
  )

  df = pd.DataFrame(response.data)
  count = response.count

  if count is None:
    raise ValueError("Supabase response count is None.")

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

  if verbose:
    print(f'Loaded {len(df)} rows out of {count}')

  return df


def equalizeClasses(
    df: pd.DataFrame,
    level_col_label: str = 'dev_level',
    verbose: bool = False,
) -> pd.DataFrame:
  '''
  Equalizes the number of samples in each class.

  :param df: The DataFrame to equalize.
  :type df: DataFrame

  :param level_col_label: The label of the level column. Defaults to ``'dev_level'``.
  :type level_col_label: str

  :param verbose: If True, print verbose output. Defaults to False.
  :type verbose: bool

  :return: The equalized DataFrame.
  :rtype: DataFrame
  '''

  # get the number of samples in each class
  min_rows = min(df[level_col_label].value_counts())

  if verbose:
    print(f'Equalizing {len(df)} samples to {min_rows} samples per class...')

  # equalize the number of samples in each class
  return df.groupby(level_col_label).apply(lambda x: x.sample(min_rows, random_state=42))


def exportKerasFolder(
    df: pd.DataFrame,
    destination: str,
    text_col_label: str = 'text',
    level_col_label: str = 'dev_level',
    training_split: float = 0.8,
    verbose: bool = False,
    force: bool = False,
) -> None:
  '''
  Export the DataFrame to a folder in Keras format.
  The folder will be compatible with ``keras.utils.text_dataset_from_directory``.
  The directory structure will be as follows::

    train/
    ├── remedial/
    │   ├── 0.txt
    │   ├── 1.txt
    │   └── ...
    ├── early_dev/
    │   ├── 2.txt
    │   ├── 3.txt
    │   └── ...
    └── ...
    test/
    ├── remedial/
    │   ├── 4.txt
    │   ├── 5.txt
    │   └── ...
    └── ...

  where each class is a folder, and each file is a text file containing the description.

  :param df: The DataFrame to export.
  :type df: DataFrame

  :param destination: The destination folder.
  :type destination: str

  :param training_split: The split ratio for training and testing. Defaults to 0.8.
  :type training_split: float

  :param text_col_label: The label of the text column. Defaults to ``'text'``.
  :type text_col_label: str

  :param level_col_label: The label of the level column. Defaults to ``'dev_level'``.
  :type level_col_label: str

  :param verbose: If True, print verbose output. Defaults to False.
  :type verbose: bool

  :param force: If True, force overwrite the destination folder. Defaults to False.
  :type force: bool
  '''

  class_names = ['remedial', 'early_dev', 'developing', 'entrustable']
  classes = df[level_col_label].unique()

  # split dataframe into classes, keeping only the "description" column

  if verbose:
    print(f'Splitting dataframe into {len(classes)} classes...')

  class_dfs = {}
  for c in classes:
    class_df = df[df[level_col_label] == c]
    if verbose:
      print(f'Found {len(class_df)} samples for class {class_names[c]}')
    class_dfs[c] = class_df[[text_col_label]]

  if verbose:
    print('Creating directory structure...')

  # create the directory structure
  for c in classes:
    os.makedirs(os.path.join(destination, 'train', class_names[c]), exist_ok=force)
    os.makedirs(os.path.join(destination, 'test', class_names[c]), exist_ok=force)

  if verbose:
    print('Writing files...')

  # split each class into training and testing sets
  for c in classes:
    class_df = class_dfs[c]
    class_df = class_df.sample(frac=1, random_state=42)  # shuffle the dataframe
    train_size = int(len(class_df) * training_split)
    train_df = class_df[:train_size]
    test_df = class_df[train_size:]

    if verbose:
      print(f'Writing {len(train_df)} training samples for class {class_names[c]}')

    # write the training set to files
    for i, row in train_df.iterrows():
      with open(os.path.join(destination, 'train', class_names[c], f'{i}.txt'), 'w') as f:
        f.write(row[text_col_label])

    if verbose:
      print(f'Writing {len(test_df)} testing samples for class {class_names[c]}')

    # write the testing set to files
    for i, row in test_df.iterrows():
      with open(os.path.join(destination, 'test', class_names[c], f'{i}.txt'), 'w') as f:
        f.write(row[text_col_label])
