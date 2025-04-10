# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-slim as base

# Update apt and install the venv package needed on slim images.
RUN apt-get update && apt-get install -y python3.11-venv && rm -rf /var/lib/apt/lists/*

# Disable pyc generation and enable unbuffered output.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Create a valid home directory for appuser.
ARG UID=10001
RUN adduser --disabled-password --gecos "" --home "/home/appuser" --shell "/sbin/nologin" --no-create-home --uid "${UID}" appuser && \
    mkdir -p /home/appuser && chown appuser:appuser /home/appuser

# Set Kaggle's config directory to a writable location.
ENV KAGGLE_CONFIG_DIR=/home/appuser/.kaggle
RUN mkdir -p /home/appuser/.kaggle && chown appuser:appuser /home/appuser/.kaggle

# Copy all application files with correct ownership.
COPY --chown=appuser:appuser . .

# Remove Windows (CR) line endings from init.sh and .env and ensure init.sh is executable.
RUN sed -i 's/\r$//' /app/init.sh && sed -i 's/\r$//' /app/.env && chmod +x /app/init.sh

# Ensure the entire /app directory is owned by appuser.
USER root
RUN chown -R appuser:appuser /app

# Switch to non-root appuser.
USER appuser

# Expose the port your application will use.
EXPOSE 8000

# At runtime, list /app, source .env, echo key environment variables,
# create /home/appuser/.kaggle/kaggle.json if it doesn't exist,
# run init.sh, list the contents of bert-model, and finally start your application.
CMD ["sh", "-c", "\
  ls -la /app; \
  if [ -f ./.env ]; then \
    echo \".env found:\"; \
    cat ./.env; \
    . ./.env; \
  else \
    echo \".env not found\"; \
  fi; \
  echo \"==================================\"; \
  echo \"Environment variables loaded:\"; \
  echo \"KAGGLE_USERNAME: $KAGGLE_USERNAME\"; \
  echo \"KAGGLE_KEY: $KAGGLE_KEY\"; \
  echo \"SUPABASE_URL: $SUPABASE_URL\"; \
  echo \"SUPABASE_SERVICE_ROLE_KEY: $SUPABASE_SERVICE_ROLE_KEY\"; \
  echo \"==================================\"; \
  if [ ! -f /home/appuser/.kaggle/kaggle.json ]; then \
    echo \"Creating /home/appuser/.kaggle/kaggle.json\"; \
    echo \"{\\\"username\\\": \\\"$KAGGLE_USERNAME\\\", \\\"key\\\": \\\"$KAGGLE_KEY\\\"}\" > /home/appuser/.kaggle/kaggle.json; \
    chmod 600 /home/appuser/.kaggle/kaggle.json; \
  fi; \
  ./init.sh; \
  ls -la bert-model; \
  .venv/bin/python listener.py"]
