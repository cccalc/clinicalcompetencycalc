"""
train.py

This script trains a Support Vector Machine (SVM) model on the data in the data directory.
It reads the data from CSV files, preprocesses it, and trains the model.
The trained model is then saved to a file in the models directory.
The script also evaluates the model on a test set and prints the accuracy.
"""

import glob
import pickle
import os

import pandas as pd
from sklearn import svm


def main() -> None:
  """
  Main function to train the SVM model.
  """

  data = {}

  for file in glob.glob('data/*.csv'):
    table_name = file.split('/')[-1].removesuffix('.csv')
    df = pd.read_csv(file)  # Read the CSV file into a DataFrame
    df = df.iloc[:, 3:]  # Remove the first three metadata columns

    data.update({table_name: df})

  for kf, df in data.items():
    print(f"Training on {kf} with {len(df)} rows", end=" --> ")

    # Check if df has less than threshold rows
    threshold = 5
    if len(df) < threshold:
      print(f"Skipping {kf} because it has less than {threshold} rows")
      continue

    # Check if df has only one class
    if df.iloc[:, -1].nunique() == 1:
      print(f"Skipping {kf} because it has only one class")
      continue

    # Check if df has NaN values
    if df.isnull().values.any():
      print(f"Skipping {kf} because it has NaN values")
      continue

    train_proportion = 0.8
    train_size = int(len(df) * train_proportion)

    # Convert the DataFrame to a NumPy array
    x_train = df.iloc[:train_size, :-1].to_numpy()
    y_train = df.iloc[:train_size, -1].to_numpy()
    x_test = df.iloc[train_size:, :-1].to_numpy()
    y_test = df.iloc[train_size:, -1].to_numpy()

    # Create and train the SVM model
    model = svm.SVC(kernel='linear', C=1.0)
    model.fit(x_train, y_train)

    # Evaluate the model
    accuracy = model.score(x_test, y_test)
    print(f"Accuracy: {accuracy:.2f}")

    # Save the trained model to a file
    # if the directory doesn't exist, create it
    if not os.path.exists('models'):
      os.makedirs('models')
    with open(f'models/{kf}.pkl', 'wb') as f:
      pickle.dump(model, f)


if __name__ == "__main__":
  main()
