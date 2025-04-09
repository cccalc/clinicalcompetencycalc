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
  display_name: string | null;
  email: string | null;
  count: number;
};

let cachedStats: SystemStats | null = null;
let lastFetched: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getSystemStats(): Promise<SystemStats> {
  const now = Date.now();
  if (cachedStats && lastFetched && now - lastFetched < CACHE_TTL_MS) {
    return cachedStats;
  }

  const supabase = createClient();

  // ✅ Total submitted forms
  const { count: totalSubmittedForms } = await supabase
    .from('form_responses')
    .select('*', { count: 'exact', head: true });

  // ✅ Active requests (active_status = true)
  const { count: activeFormRequests } = await supabase
    .from('form_requests')
    .select('*', { count: 'exact', head: true })
    .eq('active_status', true);

  // ✅ Delinquent requests: active and older than 14 days
  const { count: delinquentFormRequests } = await supabase
    .from('form_requests')
    .select('*', { count: 'exact', head: true })
    .eq('active_status', true)
    .lt('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

  // ✅ Average turnaround time (in days)
  const { data: turnaroundData } = await supabase.rpc('average_turnaround_days');

  // ✅ Delinquent raters via RPC (no params now)
  const { data: delinquentRatersData } = await supabase.rpc('get_delinquent_raters');

  const topDelinquentRaters: SystemStats['topDelinquentRaters'] = (delinquentRatersData || []).map(
    (row: DelinquentRaterRow) => ({
      rater_id: row.rater_id,
      display_name: row.display_name ?? 'Unknown',
      email: row.email ?? 'Unavailable',
      count: row.count ?? 0,
    })
  );

  // ✅ Monthly submission trends
  const { data: monthlyData } = await supabase.rpc('monthly_form_submissions');

  // ✅ EPA distribution (across form responses)
  const { data: responseData } = await supabase.from('form_responses').select('response');
  const epaCounts: Record<string, number> = {};

  responseData?.forEach((entry) => {
    const response = entry.response;
    if (!response || typeof response !== 'object') return;
    const epaKeys = Object.keys(response.response ?? {});
    for (const epaId of epaKeys) {
      epaCounts[epaId] = (epaCounts[epaId] ?? 0) + 1;
    }
  });

  const epaDistribution = Object.entries(epaCounts)
    .map(([epa, count]) => ({ epa, count }))
    .sort((a, b) => Number(a.epa) - Number(b.epa));

  // ✅ Final cached output
  cachedStats = {
    totalSubmittedForms: totalSubmittedForms ?? 0,
    activeFormRequests: activeFormRequests ?? 0,
    delinquentFormRequests: delinquentFormRequests ?? 0,
    averageTurnaroundDays: turnaroundData ?? null,
    topDelinquentRaters,
    monthlySubmissionTrends: monthlyData ?? [],
    epaDistribution,
  };

  lastFetched = now;
  return cachedStats;
}
