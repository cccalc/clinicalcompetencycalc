import re
import yaml

mcq = None

# read yaml file
with open("form-data.yaml", "r") as file:
  data = yaml.safe_load(file)
  mcq = data["mcq"]

# get unique kfs from mcq
kfs = sorted(list(set([q['kf'] for q in mcq])), key=lambda x: float(x))

print(len(kfs))

with open("sql-script.out", "w") as output_file:
  for kf in kfs:
    keys = [i for s in [list(q['options'].keys()) for q in mcq if q['kf'] == kf]
            for i in s]
    table_name = f'mcq_kf{re.sub(r"\.", "_", kf)}'

    output_file.write(f'create table trainingdata.{table_name} (\n')
    output_file.write('  id bigint generated always as identity not null,\n')
    output_file.write('  created_at timestamp with time zone null,\n')
    output_file.write('  user_id uuid null,\n')
    for key in keys:
      output_file.write(f'  c{re.sub(r"\.", "_", key)} boolean null,\n')
    output_file.write('  dev_level integer null,\n')
    output_file.write(f'  constraint {table_name}_key primary key (id),\n')
    output_file.write(
        f'  constraint {table_name}_user_id_fkey foreign KEY (user_id) references auth.users(id)\n')
    output_file.write(') TABLESPACE pg_default;\n\n')
