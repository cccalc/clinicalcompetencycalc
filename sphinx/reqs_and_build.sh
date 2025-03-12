#!/bin/bash

echo "----------------------------------------"

# Activate the virtual environment
echo "Activating virtual environment "
python3.11 -m venv .venv
source .venv/bin/activate
pip install pip --upgrade pip
pip install --no-deps -r python/svm/requirements.txt
pip install --no-deps -r python/bert/requirements.txt
pip install furo

# Build Sphinx documentation
echo "Building Sphinx documentation..."
sphinx-build -b html sphinx/source sphinx/build/html/
echo "----------------------------------------"
deactivate


echo "All tasks completed!"