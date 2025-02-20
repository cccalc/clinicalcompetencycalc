'use server';

import { createClient } from '@/utils/supabase/server';

export const getUpdaterDetails = async (
  id: string
): Promise<{ id: string; display_name: string | null; email: string } | null> => {
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

  // stringify to pass to client component
  return {
    id,
    display_name: profileData?.display_name ?? null,
    email: emailData,
  };
};
