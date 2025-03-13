"""
predict.py
"""

import glob
import pickle
# from sklearn import svm


def main() -> None:
  """
  Main function to predict the SVM model.
  """

  questions = {}
  models = {}

  print('Loading models')

  # Load the models from the pickle files
  for file in glob.glob('models/*.pkl'):
    table_name = file.split('/')[-1].removesuffix('.pkl')
    with open(file, 'rb') as f:
      model = pickle.load(f)
      models.update({table_name: model})

  print('\nLoading questions')

  # Load the questions from the CSV files
  for file in glob.glob('data/*.csv'):
    table_name = file.split('/')[-1].removesuffix('.csv')
    if table_name not in models:
      continue
    with open(file, 'r', encoding='utf-8') as f:
      # get the first line of the csv
      q_list = f.readline().strip()
      # Remove the first three metadata columns and the last column
      q_list = q_list.split(',')[3:-1]
      questions.update({table_name: q_list})

  print('Choose a table to predict:')
  for i, kf in enumerate(questions.keys()):
    print(f"{i:>2}: {kf:13}", end="\n" if (i + 1) % 5 == 0 else " " * 3)
  choice = input('\nEnter the number of the table: ')
  choice = int(choice)
  table_name = list(questions.keys())[choice]

  x_predict = []

  print("Enter the values for the options (1 for True, 0 for False):")
  for i, q in enumerate(questions[table_name]):
    q = q.split('=')[0]
    value = input(f"{i:>2}: {q}: ")
    x_predict.append(bool(int(value)))

  prediction = models[table_name].predict([x_predict])  # Predict the class
  print(f"Prediction: {prediction[0]}")
  # Convert to the same format as the training data


if __name__ == '__main__':
  main()
