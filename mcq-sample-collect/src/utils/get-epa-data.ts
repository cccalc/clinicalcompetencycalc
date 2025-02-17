'use server';

import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';

import { EPADataYAML as EPAData } from './types';

/**
 * Reads EPA data from a YAML file asynchronously.
 * @returns Parsed data from `form-data.yaml` in type `EPADataYAML`. If an error occurs, returns `undefined`.
 */
export async function getFormData(): Promise<EPAData | undefined> {
  const filePath = path.join(process.cwd(), 'src/utils/epa-questions.yaml');
  try {
    const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
    const formData = yaml.load(data) as EPAData;
    return formData;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

export async function getEPAData(): Promise<EPAData | undefined> {
  const filePath = path.join(process.cwd(), 'src/utils/epa-questions.json');
  try {
    const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
    const formData = JSON.parse(data) as EPAData;
    return formData;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
