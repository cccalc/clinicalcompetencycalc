import os
import shutil

import tensorflow as tf
import tensorflow_hub as hub
import tensorflow_text as text
from official.nlp import optimization  # to create AdamW optimizer

# import matplotlib.pyplot as plt

os.environ['TF_USE_LEGACY_KERAS'] = '1'


def main() -> None:
  """Main function."""
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

  # bert_preprocess_model = hub.KerasLayer(tfhub_handle_preprocess)
  # bert_model = hub.KerasLayer(tfhub_handle_encoder)

  text_test = ['Demonstrates situational awareness when discussing patients']
  # text_preprocessed = bert_preprocess_model(text_test)

  classifier_model = buildClassifierModel(tfhub_handle_encoder, tfhub_handle_preprocess)
  bert_raw_result = classifier_model(tf.constant(text_test))
  print(tf.sigmoid(bert_raw_result))


def buildClassifierModel(tfhub_handle_encoder: str, tfhub_handle_preprocess: str) -> tf.keras.Model:
  """
  Builds a classifier model using the BERT encoder and preprocess layers.

  :param tfhub_handle_encoder:
  :type tfhub_handle_encoder: str
  :param tfhub_handle_preprocess:
  :type tfhub_handle_preprocess: str
  :return:
  :rtype: tf.keras.Model
  """

  text_input = tf.keras.layers.Input(shape=(), dtype=tf.string, name='text')
  preprocessing_layer = hub.KerasLayer(tfhub_handle_preprocess, name='preprocessing')
  encoder_inputs = preprocessing_layer(text_input)
  encoder = hub.KerasLayer(tfhub_handle_encoder, trainable=True, name='BERT_encoder')
  outputs = encoder(encoder_inputs)
  net = outputs['pooled_output']
  net = tf.keras.layers.Dropout(0.1)(net)
  net = tf.keras.layers.Dense(1, activation=None, name='classifier')(net)
  return tf.keras.Model(text_input, net)


if __name__ == '__main__':
  main()
