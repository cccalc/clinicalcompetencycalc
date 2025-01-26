# Python Virtual Environment Setup

Follow these instructions to set up a Python virtual environment using `requirements.txt`.

## Steps

1. **Navigate to your project directory:**

   ```sh
   cd /path/to/this/folder
   ```

2. **Create a virtual environment:**

   Make sure that the virtual environment is running **Python 3.12**.
   (The `--prompt` part is optional, omitting it will simply remove the name from your terminal and replace it with a generic ".venv".)

   ```sh
   python3.12 -m venv .venv --prompt response_processing
   ```

3. **Activate the virtual environment:**

   - On macOS/Linux:
     ```sh
     source .venv/bin/activate
     ```
   - On Windows:
     ```sh
     .\.venv\Scripts\activate
     ```

4. **Install dependencies from `requirements.txt`:**

   ```sh
   pip install -r requirements.txt
   ```

5. **Deactivate the virtual environment when done:**

   ```sh
   deactivate
   ```

## Notes

- Ensure you have Python 3.12 installed on your system.

- When freezing dependencies, use the following command:

  ```sh
  pip freeze | sed 's/==/~=/' > requirements.txt
  ```

  This will ensure that any hot-fixes can be applied with no breaking changes, since none are expected with `~=`.

- To update all dependencies, you can do the following:

  ```sh
  sed -i '' 's/[~=]=/>=/' requirements.txt
  pip install -U -r requirements.txt
  pip freeze | sed 's/==/~=/' > requirements.txt
  ```
