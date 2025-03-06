import sys
import json
import yaml


def yaml_to_json(yaml_file, json_file):
  with open(yaml_file, 'r') as yf:
    yaml_content = yaml.safe_load(yf)

  with open(json_file, 'w') as jf:
    json.dump(yaml_content, jf, indent=4)


if __name__ == "__main__":
  if len(sys.argv) != 3:
    print("Usage: python yaml-to-json.py <input_yaml_file> <output_json_file>")
  else:
    yaml_file = sys.argv[1]
    json_file = sys.argv[2]
    yaml_to_json(yaml_file, json_file)
