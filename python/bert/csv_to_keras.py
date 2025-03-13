'''
Convert the latest CSV file in a given directory to a folder in Keras format.
'''

import os
import glob
import pandas as pd


def loadLatestCSV(directory: str) -> tuple[str, pd.DataFrame]:
  """
  Load the latest CSV file from a given directory into a pandas DataFrame.
  The CSV filename is expected to be in the format ``yymmdd.csv``, and contain the comment string
  and an integer class (0=remedial, ..., 3=entrustable).

  :param directory: The directory containing the CSV files.
  :type directory: str
  :return: A tuple containing the date (as a string) and the DataFrame.
  :rtype: tuple[str, DataFrame]
  """

  latest_file = max(glob.glob(os.path.join(directory, '*.csv')))
  date = os.path.splitext(os.path.basename(latest_file))[0]
  return (date, pd.read_csv(latest_file))


def exportKerasFolder(df: pd.DataFrame, destination: str, **kwargs) -> None:
  """
  Export the DataFrame to a folder in Keras format.
  The folder will be compatible with ``keras.utils.text_dataset_from_directory``.
  The directory structure will be as follows::

    train/
    ├── remedial/
    │   ├── 0.txt
    │   ├── 1.txt
    │   └── ...
    ├── early_dev/
    │   ├── 0.txt
    │   ├── 1.txt
    │   └── ...
    └── ...
    test/
    ├── remedial/
    │   ├── 0.txt
    │   ├── 1.txt
    │   └── ...
    └── ...

  where each class is a folder, and each file is a text file containing the description.

  :param df: The DataFrame to export.
  :type df: DataFrame
  :param destination: The destination folder.
  :type destination: str
  """

  training_split = kwargs.get('training_split', 0.8)
  class_names = ['remedial', 'early_dev', 'developing', 'entrustable']

  # split dataframe into classes, keeping only the "description" column
  classes = df['class'].unique()
  class_dfs = {}
  for c in classes:
    class_df = df[df['class'] == c]
    class_df = class_df[['description']]
    class_dfs[c] = class_df

  # create the directory structure
  for c in classes:
    os.makedirs(os.path.join(destination, 'train', class_names[c]), exist_ok=True)
    os.makedirs(os.path.join(destination, 'test', class_names[c]), exist_ok=True)

  # split each class into training and testing sets
  for c in classes:
    class_df = class_dfs[c]
    class_df = class_df.sample(frac=1, random_state=42)  # shuffle the dataframe
    train_size = int(len(class_df) * training_split)
    train_df = class_df[:train_size]
    test_df = class_df[train_size:]

    # write the training set to files
    for i, row in train_df.iterrows():
      with open(os.path.join(destination, 'train', class_names[c], f'{i}.txt'), 'w') as f:
        f.write(row['description'])

    # write the testing set to files
    for i, row in test_df.iterrows():
      with open(os.path.join(destination, 'test', class_names[c], f'{i}.txt'), 'w') as f:
        f.write(row['description'])


def main() -> None:
  """Main function"""

  csv_directory = os.path.join(os.getcwd(), 'data', 'raw')
  date, latest = loadLatestCSV(csv_directory)

  keras_directory = os.path.join(os.getcwd(), 'data', 'keras', date)
  exportKerasFolder(latest, keras_directory, training_split=0.8)


if __name__ == "__main__":
  main()
