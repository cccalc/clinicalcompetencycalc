'use server';

import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { createClient } from './supabase/server';
import { EPAData, MCQ } from './types';
import type { Tables } from './supabase/database.types';

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

export async function getMCQs(): Promise<MCQ | undefined> {
  const supabase = await createClient();
  const { data, error } = (await supabase
    .schema('public')
    .from('mcqs_options')
    .select()
    .order('updated_at', { ascending: false })
    .single()) satisfies PostgrestSingleResponse<Tables<'mcqs_options'>>;
  if (error) {
    console.error('Failed to fetch MCQs:', error.message);
    return undefined;
  }
  if (!data) {
    console.error('Failed to fetch MCQs: No data');
    return undefined;
  }
  return data.data as MCQ;
}
