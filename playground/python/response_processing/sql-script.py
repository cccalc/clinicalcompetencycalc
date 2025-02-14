import re
import yaml

mcq = None

# read yaml file
with open("form-data.yaml", "r") as file:
  data = yaml.safe_load(file)
  mcq = data["mcq"]

# get unique kfs from mcq
kfs = sorted(list(set([q['kf'] for q in mcq])))

for kf in kfs:
  keys = [i for s in [list(q['options'].keys()) for q in mcq if q['kf'] == kf]
          for i in s]
  table_name = f'mcq_kf{re.sub(r'\.', '_', kf)}'

  # print(f'create table trainingdata.{table_name} (')
  # print('  id bigint generated always as identity not null,'),
  # print('  created_at timestamp with time zone null,'),
  # print('  submitted_by text null,'),
  # for key in keys:
  #   print(f'  c{re.sub(r'\.', '_', key)} boolean null,'),
  # print('  dev_level integer null,')
  # print(f'  constraint {table_name}_key primary key (id)')
  # print(') TABLESPACE pg_default;')

  print(f'alter table trainingdata.{table_name}')
  print('  drop column submitted_by,')
  print('  add column submitted_by uuid,')
  print(
      f'  add constraint {table_name}_submitted_by_fkey foreign KEY (submitted_by) references auth.users (id) on update CASCADE;')

  print()
