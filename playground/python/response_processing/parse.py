from transformers import T5Tokenizer, T5ForConditionalGeneration
from nltk.tokenize import sent_tokenize

# hugging face
checkpoint = "flax-community/t5-base-wikisplit"
tokenizer = T5Tokenizer.from_pretrained(checkpoint)
model = T5ForConditionalGeneration.from_pretrained(checkpoint)


def parse_sentences_t5(sentences):
  """
  This Python function takes a list of sentences, tokenizes them using a
  tokenizer, generates simpler sentences using a model, and returns the simplified
  sentences as a string separated by newlines.

  :param sentences: The `parse_sentences_t5` function takes a string of sentences
  as input, tokenizes the sentences using a tokenizer, generates simpler versions
  of the sentences using a T5 model, and then returns the simplified sentences as
  a single string separated by double newline characters
  :return: The function `parse_sentences_t5` takes a string of sentences as input,
  tokenizes the sentences using a T5 model, generates simplified versions of the
  sentences, and returns the simplified sentences as a single string separated by
  newline characters ("\n\n").
  """
  complex_sentences = sent_tokenize(sentences)

  encoder_max_length = 256
  decoder_max_length = 256
  complex_tokenized = tokenizer(complex_sentences,
                                padding="max_length",
                                truncation=True,
                                max_length=encoder_max_length,
                                return_tensors='pt')
  simple_tokenized = model.generate(
      complex_tokenized['input_ids'], attention_mask=complex_tokenized['attention_mask'],
        max_length=encoder_max_length, num_beams=5)
  simple_sentences = tokenizer.batch_decode(
      simple_tokenized, skip_special_tokens=True)

  return "\n\n".join(simple_sentences)


# Example usage
sentence = "The impact of social determinants on care disparities underscored \
            his commitment to understanding the broader context of healthcare \
            delivery. He independently evaluated a transition of care management \
            appointment for an AIDS/HIV patient who was found to have pneumocystis \
            pneumonia and toxoplasmosis. Nguyen discovered the patient was \
            discharged on Atripla but was non-compliant due to side effects \
            experienced with efavirenz-containing component. The alternate \
            choice, Biktarvy, proved to be too expensive and was not able to be \
            discounted further through the 340B program."
phrases = parse_sentences_t5(sentence)
print(phrases)
