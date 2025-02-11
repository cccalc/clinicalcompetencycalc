import Content from './content';
import {FormDataYAML} from '@/data/types';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export default function Home() {
  const filePath = path.join(process.cwd(), 'src/data/form-data.yaml');
  let formData: FormDataYAML | undefined = undefined;

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    formData = yaml.load(fileContents) as FormDataYAML;
  } catch (e) {
    console.log(e);
  }

  return <Content formData={formData} />;
}
