'''
Converts the supabase dataset to a keras dataset.
'''

import os

import argparse
import pandas as pd

from utils import equalizeClasses, exportKerasFolder, querySupabase


def main(args: argparse.Namespace) -> None:
  '''
  Converts the supabase dataset to a keras dataset.
  '''

  dataset_name = args.ds_name
  if dataset_name is None:
    yymmdd = pd.Timestamp.now().strftime('%y%m%d')
    dataset_name = f'{yymmdd}-{args.split * 100:.0f}'
    if args.equalize:
      dataset_name += '-eq'

  force = args.force
  training_split = args.split
  verbose = args.verbose

  if not 0 <= training_split <= 1:
    raise ValueError("Training split must be between 0 and 1.")

  if verbose:
    print(f'Creating dataset {dataset_name}...')

  df = querySupabase(verbose=verbose)

  if args.equalize:
    df = equalizeClasses(df, verbose=verbose)

  if args.no_export:
    return

  keras_directory = os.path.join(os.getcwd(), 'data', 'keras', dataset_name)
  exportKerasFolder(df, keras_directory, training_split=training_split,
                    verbose=verbose, force=force)

  if verbose:
    print(f'Dataset {dataset_name} created at {keras_directory}')


if __name__ == "__main__":
  parser = argparse.ArgumentParser(description='Convert supabase dataset to keras dataset.')

  parser.add_argument('-f', '--force',
                      help='force overwrite if destination folder exists', action='store_true')
  parser.add_argument('-s', '--split', type=float, default=0.8,
                      help='specify a training split; default is 0.8')
  parser.add_argument('-v', '--verbose',
                      help='verbose output', action='store_true')

  parser.add_argument('--ds_name', type=str, default=None,
                      help='custom dataset name; default is yymmdd-split[-eq]')
  parser.add_argument('--equalize',
                      help='equalize the number of samples in each class', action='store_true')
  parser.add_argument('--no-export',
                      help='do not export the dataset', action='store_true')

  main(parser.parse_args())
