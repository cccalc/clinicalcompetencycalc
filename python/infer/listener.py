import asyncio
import os
# import json

from supabase import AClient, acreate_client
from dotenv import load_dotenv


async def main() -> None:
  """
  Connects to the Supabase Realtime server and subscribes to a channel.

  :return: None
  """

  print("Loading environment variables...")

  load_dotenv()

  url: str = os.environ.get("SUPABASE_URL", "")
  key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

  if url == "" or key == "":
    raise ValueError("Supabase URL or key not found in environment variables.")

  print("Environment variables loaded.")

  # try:
  supabase: AClient = await acreate_client(url, key)

  await supabase.realtime.connect()

  await (supabase.realtime
         .channel("form_responses_insert")
         .on_postgres_changes("INSERT", schema="public", table="form_responses", callback=handle_new_response)
         .subscribe())

  await supabase.realtime.listen()

  print('Subscribed to the "form_responses_insert" channel. Waiting for new responses...')

  while True:
    await asyncio.sleep(1)


def handle_new_response(payload) -> None:
  '''
  Handles the insert event from the Supabase Realtime server.

  :param payload: The payload received from the Supabase Realtime server.
  :type payload: dict

  :return: None
  '''

  record = payload['data']['record']

  print('New response received:', record['response_id'])

  response_data = record['response']['response']


if __name__ == "__main__":
  asyncio.run(main())
