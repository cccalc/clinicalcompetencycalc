// utils/getSystemStats.ts
import { createClient } from '@/utils/supabase/client';

export interface SystemStats {
  totalSubmittedForms: number;
  activeFormRequests: number;
  delinquentFormRequests: number;
  averageTurnaroundDays: number | null;
  topDelinquentRaters: {
    rater_id: string;
    display_name: string;
    email: string;
    count: number;
  }[];
  monthlySubmissionTrends: { month: string; count: number }[];
  epaDistribution: { epa: string; count: number }[];
}

type DelinquentRaterRow = {
  rater_id: string;
  created_at: string;
  rater: {
    id: string;
    display_name: string | null;
  } | null;
};

let cachedStats: SystemStats | null = null;
let lastFetched: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getSystemStats(delinquentThresholdDays = 14): Promise<SystemStats> {
  const now = Date.now();
  if (cachedStats && lastFetched && now - lastFetched < CACHE_TTL_MS) {
    return cachedStats;
  }

  const supabase = createClient();

  const nowDate = new Date();
  const delinquentCutoff = new Date(nowDate);
  delinquentCutoff.setDate(nowDate.getDate() - delinquentThresholdDays);

  // Submitted forms
  const { count: totalSubmittedForms } = await supabase
    .from('form_responses')
    .select('*', { count: 'exact', head: true });

  // Active form requests (pending)
  const { count: activeFormRequests } = await supabase
    .from('form_requests')
    .select('*', { count: 'exact', head: true });

  // Delinquent forms
  const { count: delinquentFormRequests } = await supabase
    .from('form_requests')
    .select('*', { count: 'exact', head: true })
    .is('completed_at', null)
    .lt('created_at', delinquentCutoff.toISOString());

  // Average turnaround time (in days)
  const { data: turnaroundData } = await supabase.rpc('average_turnaround_days');

  // Top delinquent raters with profile join
  const { data: topRatersData } = (await supabase
    .from('form_requests')
    .select('rater_id, created_at, rater:profiles (id, display_name)')
    .is('completed_at', null)
    .lt('created_at', delinquentCutoff.toISOString())) as { data: DelinquentRaterRow[] | null };

  const raterMap = new Map<string, { display_name: string; count: number }>();

  topRatersData?.forEach((req) => {
    const id = req.rater_id;
    const name = req.rater?.display_name || 'Unknown';
    if (!raterMap.has(id)) {
      raterMap.set(id, { display_name: name, count: 1 });
    } else {
      raterMap.get(id)!.count += 1;
    }
  });

  // Fetch emails using get_email_by_user_id
  const topDelinquentRaters: SystemStats['topDelinquentRaters'] = [];

  for (const [rater_id, { display_name, count }] of raterMap.entries()) {
    const { data: emailData } = await supabase.rpc('get_email_by_user_id', { user_id_input: rater_id });
    topDelinquentRaters.push({
      rater_id,
      display_name,
      email: emailData ?? 'Not available',
      count,
    });
  }

  topDelinquentRaters.sort((a, b) => b.count - a.count);

  // Monthly submission trends
  const { data: monthlyData } = await supabase.rpc('monthly_form_submissions');

  // EPA distribution (accurately pulling from response[epa])
  const { data: responseData } = await supabase.from('form_responses').select('response');

  const epaCounts: Record<string, number> = {};

  // ✅ Loop through each form response
  responseData?.forEach((entry) => {
    const response = entry.response;

    if (!response || typeof response !== 'object') return;

    // 🔥 FIX: drill into response.response to get EPA keys
    const epaKeys = Object.keys(response.response ?? {});

    for (const epaId of epaKeys) {
      if (!epaCounts[epaId]) {
        epaCounts[epaId] = 1;
      } else {
        epaCounts[epaId]++;
      }
    }
  });

  const epaDistribution = Object.entries(epaCounts)
    .map(([epa, count]) => ({ epa, count }))
    .sort((a, b) => Number(a.epa) - Number(b.epa));

  cachedStats = {
    totalSubmittedForms: totalSubmittedForms || 0,
    activeFormRequests: activeFormRequests || 0,
    delinquentFormRequests: delinquentFormRequests || 0,
    averageTurnaroundDays: turnaroundData?.average || null,
    topDelinquentRaters,
    monthlySubmissionTrends: monthlyData || [],
    epaDistribution,
  };

  lastFetched = now;
  return cachedStats;
}
