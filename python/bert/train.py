import os
import shutil

import tensorflow as tf
import tensorflow_hub as hub
import tensorflow_text as text
from official.nlp import optimization  # to create AdamW optimizer

import matplotlib.pyplot as plt


def main() -> None:
  tf.get_logger().setLevel('ERROR')

  AUTOTUNE = tf.data.AUTOTUNE
  batch_size = 32
  seed = 42

  data_dir = os.path.join(os.getcwd(), 'data', 'keras')
  latest_folder = max([f for f in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, f))])
  latest_dir = os.path.join(data_dir, latest_folder)

  raw_train_ds = tf.keras.utils.text_dataset_from_directory(
      os.path.join(latest_dir, 'train'),
      batch_size=batch_size,
      validation_split=0.2,
      subset='training',
      seed=seed)
  train_ds = raw_train_ds.cache().prefetch(buffer_size=AUTOTUNE)
  class_names = raw_train_ds.class_names

  raw_val_ds = tf.keras.utils.text_dataset_from_directory(
      os.path.join(latest_dir, 'train'),
      batch_size=batch_size,
      validation_split=0.2,
      subset='validation',
      seed=seed)
  val_ds = raw_val_ds.cache().prefetch(buffer_size=AUTOTUNE)

  raw_test_ds = tf.keras.utils.text_dataset_from_directory(
      os.path.join(latest_dir, 'test'),
      batch_size=batch_size)
  test_ds = raw_test_ds.cache().prefetch(buffer_size=AUTOTUNE)

  tfhub_handle_encoder = 'https://tfhub.dev/google/experts/bert/pubmed/2'
  tfhub_handle_preprocess = 'https://tfhub.dev/tensorflow/bert_en_uncased_preprocess/3'

  bert_preprocess_model = hub.KerasLayer(tfhub_handle_preprocess)

  text_test = ['Demonstrates situational awareness when discussing patients']
  text_preprocessed = bert_preprocess_model(text_test)

  print(f'Keys       : {list(text_preprocessed.keys())}')
  print(f'Shape      : {text_preprocessed["input_word_ids"].shape}')
  print(f'Word Ids   : {text_preprocessed["input_word_ids"][0, :12]}')
  print(f'Input Mask : {text_preprocessed["input_mask"][0, :12]}')
  print(f'Type Ids   : {text_preprocessed["input_type_ids"][0, :12]}')


if __name__ == '__main__':
  main()
