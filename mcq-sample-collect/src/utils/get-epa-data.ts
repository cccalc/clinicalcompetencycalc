'use server';

import { EPAData } from './types';

/**
 * Reads EPA data from Supabase storage API.
 * @returns Parsed data from `form-data.json` in type `EPAData`. If an error occurs, returns `undefined`.
 */
export async function getEPAData(): Promise<EPAData | undefined> {
  const response = await fetch(
    'https://speeohoyelvckretnfao.supabase.co/storage/v1/object/public/epa-questions/epa-questions.json'
  );
  if (!response.ok) {
    console.error('Failed to fetch EPA data:', response.statusText);
    return undefined;
  }
  const data = (await response.json()) as EPAData;
  return data;
}
