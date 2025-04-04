import asyncio
import os
# import json

from supabase import AClient, Client, acreate_client, create_client
from dotenv import load_dotenv

from inference import bert_infer, download_svm_models, load_bert_model, load_svm_models, svm_infer


async def main() -> None:
  """
  Connects to the Supabase Realtime server and subscribes to a channel.

  :return: None
  """

  download = False

  print("Loading environment variables...")

  load_dotenv()

  url: str = os.environ.get("SUPABASE_URL", "")
  key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

  if url == "" or key == "":
    raise ValueError("Supabase URL or key not found in environment variables.")

  print("Environment variables loaded.")

  supabase: Client = create_client(url, key)
  asupabase: AClient = await acreate_client(url, key)

  if download:
    download_svm_models(supabase)

  bert_model = load_bert_model("bert-model/cb-250401-80_7114_model")
  svm_models = load_svm_models()

  print("Connecting to Supabase Realtime server...")

  await asupabase.realtime.connect()

  await (asupabase.realtime
         .channel("form_responses_insert")
         .on_postgres_changes("INSERT",
                              schema="public", table="form_responses",
                              callback=lambda payload:
                              handle_new_response(payload, bert_model, svm_models, supabase))
         .subscribe())

  await asupabase.realtime.listen()

  print('Subscribed to the "form_responses_insert" channel. Waiting for new responses...')

  while True:
    await asyncio.sleep(1)


def handle_new_response(payload, bert_model, svm_models, supabase) -> None:
  '''
  Handles the insert event from the Supabase Realtime server.

  :param payload: The payload received from the Supabase Realtime server.
  :type payload: dict

  :return: None
  '''

  record = payload['data']['record']

  print('New response received:', record['response_id'])

  response = record['response']['response']

  print("Processing response", response)

  ds = [kf for kf in response.values()]
  flat = {k: {
      'bert': v['text'],
      'svm': [vv for kk, vv in v.items() if kk != 'text']
  } for d in ds for k, v in d.items()}

  bert_res = bert_infer(bert_model, {k: v['bert'] for k, v in flat.items()})
  svms_res = svm_infer(svm_models, {k: v['svm'] for k, v in flat.items()})

  def weighted_average(bert: float, svm: float) -> float:
    return bert * 0.25 + svm * 0.75

  res = {k: weighted_average(bert=v, svm=svms_res[k]) for k, v in bert_res.items()}
  print('res', res)

  (supabase.table("form_results")
   .insert({"response_id": record['response_id'], "results": res})
   .execute())


if __name__ == "__main__":
  asyncio.run(main())
