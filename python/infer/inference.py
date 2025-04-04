'''
Inference module for BERT model to classify sentences.
This module loads a pre-trained BERT model and predicts the class for each sentence
'''

import os

import tensorflow as tf
import tensorflow_text as text  # pylint: disable=unused-import

from supabase import Client


def bert_infer(data: dict[str, list[str]]) -> dict[str, int]:
  '''
  Loads a pre-trained BERT model and predicts the class for each sentence.

  :param input: A dictionary where keys are key functions and values are the sentences to
  be classified.
  :type input: dict[str, list[str]]

  :return: A dictionary where keys are sentence identifiers and values are the predicted class
  indices.
  :rtype: dict[str, int]
  '''

  # pylint: disable=no-member
  model = tf.keras.models.load_model("bert-model/cb-250401-80_7114_model", compile=False)

  def get_class(sentences: list[str]) -> int:
    prediction = model.predict(sentences).tolist()
    summed_prediction = [sum(x) for x in zip(*prediction)]
    return summed_prediction.index(max(summed_prediction))

  return {k: get_class(v) for k, v in data.items()}


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
