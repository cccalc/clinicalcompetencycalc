Usage
=====

Installation
------------

You can stylize code like this:
.. code-block:: console

   (.venv) $ pip install lumache

Functions
----------------

.. autofunction:: lumache.get_random_ingredients
.. autofunction:: parse.parse_sentences_t5

>>> from transformers import T5Tokenizer, T5ForConditionalGeneration
>>> from nltk.tokenize import sent_tokenize

>>> import lumache
>>> lumache.get_random_ingredients()
['shells', 'gorgonzola', 'parsley']