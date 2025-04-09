'''
Inference module for BERT model to classify sentences.
This module loads a pre-trained BERT model and predicts the class for each sentence
'''

import os
import pickle
import re

import tensorflow as tf
import tensorflow_text as text  # pylint: disable=unused-import

from supabase import Client


def bert_infer(model: tf.keras.Model, data: dict[str, list[str]]) -> dict[str, int]:  # pylint: disable=no-member
  '''
  Loads a pre-trained BERT model and predicts the class for each sentence.

  :param model: The pre-trained BERT model to use for inference.
  :type model: tf.keras.Model

  :param input: A dictionary where keys are key functions and values are the sentences to
  be classified.
  :type input: dict[str, list[str]]

  :return: A dictionary where keys are sentence identifiers and values are the predicted class
  indices.
  :rtype: dict[str, int]
  '''
  print("Running inference on BERT model...")

  def get_class(sentences: list[str]) -> int:
    prediction = model.predict(sentences).tolist()
    summed_prediction = [sum(x) for x in zip(*prediction)]
    return summed_prediction.index(max(summed_prediction))

  return {k: get_class(v) for k, v in data.items()}


def svm_infer(models: dict[str, any], data: dict[str, list[bool]]) -> dict[str, int]:
  '''
  Loads pre-trained SVM models and predicts the class for each response.

  :param models: A dictionary where keys are model names and values are the loaded SVM models.
  :type models: dict[str, any]

  :param data: A dictionary where keys are key functions and values are the responses to be
  classified.
  :type data: dict[str, list[str]]

  :return: A dictionary where keys are response identifiers and values are the predicted class
  indices.
  :rtype: dict[str, int]
  '''
  print("Running inference on SVM models...")

  def get_class(kf, response: list[bool]) -> int:
    kf = 'mcq_kf' + re.sub(r'\.', '_', kf)
    return models[kf].predict([response])[0]

  return {k: get_class(k, v) for k, v in data.items()}


def load_bert_model(model_path: str):
  '''
  Loads a pre-trained BERT model from the specified path.

  :param model_path: The path to the pre-trained BERT model.
  :type model_path: str

  :return: The loaded BERT model.
  :rtype: tf.keras.Model
  '''
  if not os.path.exists(model_path):
    raise FileNotFoundError(f"The model path '{model_path}' does not exist.")

  print(f"Loading BERT model from {model_path}...", end=" ")
  # pylint: disable=no-member
  model = tf.keras.models.load_model(model_path, compile=False)
  print("BERT model loaded successfully.")
  return model


def download_svm_models(supabase: Client) -> None:
  '''
  Downloads the pre-trained SVM models from the remote server.
  '''

  # Ensure the "svm-models" directory exists
  if not os.path.exists("svm-models"):
    os.makedirs("svm-models")

  print("Downloading SVM models from Supabase...")
  bucket_name = "svm-models"
  bucket = supabase.storage.from_(bucket_name)
  models = bucket.list()
  for model in models:
    model_name = model['name']
    print(f"Downloading {model_name}...", end=" ")
    file_path = f"svm-models/{model_name}"
    with open(file_path, "wb") as f:
      response = bucket.download(model_name)
      f.write(response)
    print(f"to svm-models/{model_name}")
  print("All SVM models downloaded successfully.")


def load_svm_models() -> dict[str, any]:
  '''
  Loads the pre-trained SVM models from the local "svm-models" directory.

  :return: A dictionary where keys are model names and values are the loaded SVM models.
  :rtype: dict[str, any]
  '''
  svm_models = {}
  print("Loading SVM models from 'svm-models' directory...")

  for filename in os.listdir("svm-models"):
    if filename.endswith(".pkl"):
      model_path = os.path.join("svm-models", filename)
      print(f"Loading {filename}...", end=" ")
      with open(model_path, "rb") as f:
        svm_models[filename.removesuffix('.pkl')] = pickle.load(f)
      print("loaded successfully.")

  print("All SVM models loaded successfully.")
  return svm_models
