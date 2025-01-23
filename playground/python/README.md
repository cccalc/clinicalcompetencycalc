# Python Virtual Environment Setup

Follow these instructions to set up a Python virtual environment using `requirements.txt`.

## Steps

1. **Navigate to your project directory:**

```sh
cd /path/to/your/project
```

2. **Create a virtual environment:**

```sh
python3 -m venv venv
```

3. **Activate the virtual environment:**

- On macOS/Linux:
  ```sh
  source venv/bin/activate
  ```
- On Windows:
  ```sh
  .\venv\Scripts\activate
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

- Ensure you have Python 3 installed on your system.
- Use `pip freeze > requirements.txt` to generate a `requirements.txt` file from your current environment.
