import tensorflow as tf
import tensorflow_text as text


def bert_infer(sentences: list[str]) -> list[str]:
  model = tf.keras.models.load_model("bert-model/cb-250401-80_7114_model", compile=False)

  prediction = model.predict(sentences)

  plist = prediction.tolist()

  strlen = 110

  for sentence, pred in zip(sentences, plist):
    print(f'- {sentence[:strlen - 3] + "..." if len(sentence) > strlen else sentence}')
    max_index = pred.index(max(pred))
    print(f'  Predicted class: {max_index} (Confidence: {pred[max_index]:.4f})\n')


sentences = [
    "Provided a monotone, scripted presentation with no context.",
    "Overlooked airway obstruction in post-op patient.",
    "could work on his confidence  More confidence will come with more experience.",
    "Gathered history efficiently but struggled with prioritizing pertinent positives/negatives.",
    "knew when to take time organizing his thoughts and researching when he needed to double-check something in his assessment and plans.",
    "Ensured oxygen and suction setup for deteriorating patient.",
    "Highlighted team accomplishments during debriefing.",
    "Improved flow by streamlining information sharing in rounds.",
]

bert_infer(sentences)
