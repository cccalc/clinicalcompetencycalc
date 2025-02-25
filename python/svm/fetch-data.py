import os
from supabase import create_client, Client
from dotenv import load_dotenv


def main():
  # Load environment variables from .env file
  load_dotenv()

  url: str = os.environ.get("SUPABASE_URL")
  key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
  supabase: Client = create_client(url, key)

  response = (supabase
              .schema("public")
              .table("epa_kf_descriptions")
              .select("*")
              .execute())

  print(response)


if __name__ == "__main__":
  main()
