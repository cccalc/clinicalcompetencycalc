'''
Inference module for BERT model to classify sentences.
This module loads a pre-trained BERT model and predicts the class for each sentence
'''

import tensorflow as tf
import tensorflow_text as text  # pylint: disable=unused-import


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
