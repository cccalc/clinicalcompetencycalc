"""
This module contains the training script for the BERT model.
"""

import os

import tensorflow as tf
import tensorflow_hub as hub
from official.nlp import optimization  # to create AdamW optimizer

import matplotlib.pyplot as plt

os.environ['TF_USE_LEGACY_KERAS'] = '1'


def main() -> None:
  """Main function."""
  tf.get_logger().setLevel('ERROR')

  data_dir = os.path.join(os.getcwd(), 'data', 'keras')
  train_ds, val_ds, test_ds, _ = loadLatestDataset(data_dir, batch_size=32, seed=42)

  tfhub_handle_encoder = 'https://tfhub.dev/google/experts/bert/pubmed/2'
  tfhub_handle_preprocess = 'https://tfhub.dev/tensorflow/bert_en_uncased_preprocess/3'

  classifier_model = buildClassifierModel(tfhub_handle_encoder, tfhub_handle_preprocess)

  history = trainModel(train_ds, val_ds, classifier_model, epochs=5, init_lr=3e-5)

  loss, accuracy = classifier_model.evaluate(test_ds)
  print(f'Loss: {loss}, Accuracy: {accuracy}')

  plotHistory(history)


def loadLatestDataset(
    data_dir: str, batch_size=32, seed=42
) -> tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset, list[str]]:
  """
  Loads the latest dataset from the specified directory.

  :param data_dir: The directory containing the dataset.
  :type data_dir: str

  :param batch_size: The batch size for sampling from the dataset.
  :type batch_size: int

  :param seed: The random seed for shuffling the dataset.
  :type seed: int

  :return: The training, validation, and test datasets, as well as the class names.
  :rtype: tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset, list[str]]
  """

  autotune = tf.data.AUTOTUNE

  latest_folder = max([f for f in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, f))])
  latest_dir = os.path.join(data_dir, latest_folder)

  raw_train_ds = tf.keras.utils.text_dataset_from_directory(
      os.path.join(latest_dir, 'train'),
      batch_size=batch_size,
      validation_split=0.2,
      subset='training',
      seed=seed)

  def oneHotLabels(x, y):
    return x, tf.one_hot(y, depth=len(raw_train_ds.class_names))

  train_ds = raw_train_ds.map(oneHotLabels).cache().prefetch(buffer_size=autotune)

  raw_val_ds = tf.keras.utils.text_dataset_from_directory(
      os.path.join(latest_dir, 'train'),
      batch_size=batch_size,
      validation_split=0.2,
      subset='validation',
      seed=seed)
  val_ds = raw_val_ds.map(oneHotLabels).cache().prefetch(buffer_size=autotune)

  raw_test_ds = tf.keras.utils.text_dataset_from_directory(
      os.path.join(latest_dir, 'test'),
      batch_size=batch_size)
  test_ds = raw_test_ds.map(oneHotLabels).cache().prefetch(buffer_size=autotune)

  return train_ds, val_ds, test_ds, raw_test_ds.class_names


def buildClassifierModel(tfhub_handle_encoder: str, tfhub_handle_preprocess: str) -> tf.keras.Model:
  """
  Builds a classifier model using the BERT encoder and preprocess layers.

  :param tfhub_handle_encoder: The URL of the BERT encoder.
  :type tfhub_handle_encoder: str

  :param tfhub_handle_preprocess: The URL of the BERT preprocess layer.
  :type tfhub_handle_preprocess: str

  :return: The classifier model.
  :rtype: tf.keras.Model
  """

  text_input = tf.keras.layers.Input(shape=(), dtype=tf.string, name='text')
  preprocessing_layer = hub.KerasLayer(tfhub_handle_preprocess, name='preprocessing')
  encoder_inputs = preprocessing_layer(text_input)
  encoder = hub.KerasLayer(tfhub_handle_encoder, trainable=True, name='BERT_encoder')
  outputs = encoder(encoder_inputs)
  net = outputs['pooled_output']
  net = tf.keras.layers.Dropout(0.1)(net)
  net = tf.keras.layers.Dense(4, activation='softmax', name='classifier')(net)
  return tf.keras.Model(text_input, net)


def trainModel(
    train_ds: tf.data.Dataset, val_ds: tf.data.Dataset, model: tf.keras.Model,
    epochs=5, init_lr=3e-5
) -> tf.keras.callbacks.History:
  """
  Trains the model using the specified datasets.

  :param train_ds: The training dataset.
  :type train_ds: tf.data.Dataset

  :param val_ds: The validation dataset.
  :type val_ds: tf.data.Dataset

  :param model: The model to be trained.
  :type model: tf.keras.Model

  :param epochs: The number of epochs to train the model.
  :type epochs: int

  :param init_lr: The initial learning rate for the optimizer.
  :type init_lr: float

  :return: The training history.
  :rtype: tf.keras.callbacks.History
  """

  loss = tf.keras.losses.CategoricalCrossentropy()
  metrics = tf.metrics.CategoricalAccuracy()

  steps_per_epoch = tf.data.experimental.cardinality(train_ds).numpy()
  num_train_steps = steps_per_epoch * epochs
  num_warmup_steps = int(0.1*num_train_steps)

  optimizer = optimization.create_optimizer(
      init_lr=init_lr,
      num_train_steps=num_train_steps,
      num_warmup_steps=num_warmup_steps,
      optimizer_type='adamw')

  model.compile(optimizer=optimizer, loss=loss, metrics=metrics)

  print('Training model')
  return model.fit(x=train_ds, validation_data=val_ds, epochs=epochs)


def plotHistory(history: tf.keras.callbacks.History) -> None:
  """
  Plots the training history.

  :param history: The training history.
  :type history: tf.keras.callbacks.History
  """

  history_dict = history.history
  print(history_dict.keys())

  acc = history_dict['categorical_accuracy']
  val_acc = history_dict['val_categorical_accuracy']
  loss = history_dict['loss']
  val_loss = history_dict['val_loss']

  epochs = range(1, len(acc) + 1)
  fig = plt.figure(figsize=(10, 6))
  fig.tight_layout()

  plt.subplot(2, 1, 1)
  # r is for "solid red line"
  plt.plot(epochs, loss, 'r', label='Training loss')
  # b is for "solid blue line"
  plt.plot(epochs, val_loss, 'b', label='Validation loss')
  plt.title('Training and validation loss')
  # plt.xlabel('Epochs')
  plt.ylabel('Loss')
  plt.legend()

  plt.subplot(2, 1, 2)
  plt.plot(epochs, acc, 'r', label='Training acc')
  plt.plot(epochs, val_acc, 'b', label='Validation acc')
  plt.title('Training and validation accuracy')
  plt.xlabel('Epochs')
  plt.ylabel('Accuracy')
  plt.legend(loc='lower right')
  plt.show()


if __name__ == '__main__':
  main()
