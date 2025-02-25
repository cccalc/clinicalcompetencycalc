'use server';

import { getLatestMCQs } from '@/utils/get-epa-data';
import { createClient } from '@/utils/supabase/server';

export async function getUpdaterDetails(
  id: string
): Promise<{ id: string; display_name: string | null; email: string } | null> {
  const supabase = await createClient();

  const { data: profileData, error: fetchProfileError } = await supabase
    .schema('public')
    .from('profiles')
    .select('display_name')
    .eq('id', id)
    .single();

  if (fetchProfileError) {
    console.error('Error fetching updater details:', fetchProfileError);
    return null;
  }

  const { data: emailData, error: fetchEmailError } = await supabase
    .schema('public')
    .rpc('get_email_by_user_id', { user_id: id });

  if (fetchEmailError) {
    console.error('Error fetching updater email:', fetchEmailError);
    return null;
  }

  if (!emailData || emailData.length === 0) {
    console.error('No email data found for updater ID:', id);
    return null;
  }

  return {
    id,
    display_name: profileData?.display_name ?? null,
    email: emailData,
  };
}

export async function submitNewOption(key: string, newText: string) {
  const supabase = await createClient();

  const mcqs = await getLatestMCQs();

  if (!mcqs) {
    console.error('No MCQs found');
    return;
  }

  const newMCQs = mcqs.map((mcq) => {
    if (mcq.options[key]) mcq.options[key] = newText;
    return mcq;
  });

  const { error } = await supabase.schema('public').from('mcqs_options').insert({ data: newMCQs });

  if (error) console.error('Error updating MCQ option:', error);
}
