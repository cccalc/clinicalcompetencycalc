// import { createClient } from './client';

// const supabase = createClient();

// WE ARE NOT USING THIS
// export async function isAdmin(userId: string): Promise<boolean> {
//   const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();

//   if (error) {
//     console.error('Error fetching user role:', error.message || error);
//     return false;
//   }

//   if (!data) {
//     console.log('No role found for user, assuming student role');
//     return false;
//   }

//   return data.role === 'ccc_admin';
// }
