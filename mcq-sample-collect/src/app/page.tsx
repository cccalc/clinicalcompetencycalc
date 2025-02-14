import ClientPage from './client-page';
import {FormDataYAML} from '../utils/types';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// import styles from './page.module.css';

export default function Home() {
  const filePath = path.join(process.cwd(), 'src/utils/form-data.yaml');
  let formData: FormDataYAML | undefined = undefined;

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    formData = yaml.load(fileContents) as FormDataYAML;
  } catch (e) {
    console.log(e);
  }

  return <ClientPage formData={formData} />;
}
