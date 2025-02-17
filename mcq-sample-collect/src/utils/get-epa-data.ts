'use server';

import { EPADataYAML } from './types';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Reads EPA data from a YAML file asynchronously.
 * @returns Parsed data from `form-data.yaml` in type `EPADataYAML`. If an error occurs, returns `undefined`.
 */
export async function getFormData(): Promise<EPADataYAML | undefined> {
  const filePath = path.join(process.cwd(), 'src/utils/epa-questions.yaml');
  try {
    const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
    const formData = yaml.load(data) as EPADataYAML;
    return formData;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
