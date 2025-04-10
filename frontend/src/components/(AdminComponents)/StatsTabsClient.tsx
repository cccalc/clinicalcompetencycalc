'use client';

import { useEffect, useState } from 'react';
import { getSystemStats, SystemStats } from '@/utils/getSystemStats';

const tabs = ['Overview', 'Delinquent Raters', 'Monthly Trends', 'EPA Distribution'] as const;
type TabType = (typeof tabs)[number];

export default function StatsTabsClient() {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getSystemStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch system stats:', err);
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <div className='text-muted'>Loading statistics...</div>;
  if (!stats) return <div className='text-danger'>Failed to load statistics.</div>;

  return (
    <div className='p-3 rounded' style={{ backgroundColor: '#f1f3f5' }}>
      <div className='card shadow-sm p-3 border-0 bg-white'>
        <div className='card-header d-flex justify-content-between align-items-center bg-white border-bottom'>
          <h5 className='m-0 text-dark'>System Statistics</h5>
          <div className='d-flex align-items-center gap-2'>
            <div className='dropdown'>
              <button
                className='btn btn-outline-secondary btn-sm dropdown-toggle'
                type='button'
                data-bs-toggle='dropdown'
              >
                <i className='bi bi-graph-up'></i> {activeTab}
              </button>
              <ul className='dropdown-menu'>
                {tabs.map((tab) => (
                  <li key={tab}>
                    <button className='dropdown-item' onClick={() => setActiveTab(tab)}>
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className='btn btn-sm btn-outline-primary'
              onClick={() => {
                setRefreshing(true);
                loadStats();
              }}
              disabled={refreshing}
            >
              {refreshing ? (
                <span className='spinner-border spinner-border-sm me-2' role='status' />
              ) : (
                <i className='bi bi-arrow-clockwise me-1'></i>
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className='card-body'>
          {activeTab === 'Overview' && (
            <div className='d-flex flex-wrap gap-3'>
              <StatCard label='Submitted Forms' value={stats.totalSubmittedForms} />
              <StatCard label='Active Requests' value={stats.activeFormRequests} />
              <StatCard label='Delinquent Requests' value={stats.delinquentFormRequests} />
              <StatCard
                label='Avg. Turnaround (days)'
                value={stats.averageTurnaroundDays != null ? stats.averageTurnaroundDays.toFixed(1) : 'N/A'}
              />
            </div>
          )}

          {activeTab === 'Delinquent Raters' && (
            <div>
              {stats.topDelinquentRaters.length > 0 ? (
                <ul className='list-group'>
                  {stats.topDelinquentRaters.map((r) => (
                    <li
                      key={r.rater_id}
                      className='list-group-item d-flex justify-content-between align-items-start flex-column flex-sm-row'
                    >
                      <div>
                        <div className='fw-semibold'>{r.display_name}</div>
                        <div className='text-muted small'>{r.email}</div>
                      </div>
                      <span className='badge bg-danger align-self-sm-center mt-2 mt-sm-0'>{r.count} overdue</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-muted mb-0'>No delinquent raters at this time.</p>
              )}
              <p className='text-muted small mt-2'>
                Raters listed here have active requests open for more than 14 days.
              </p>
            </div>
          )}

          {activeTab === 'Monthly Trends' && (
            <div className='w-100 p-3'>
              <h6 className='text-muted mb-3'>Monthly Submission Trends</h6>
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg width='100%' height='200' viewBox='0 0 600 200'>
                  <line x1='40' y1='10' x2='40' y2='180' stroke='#ccc' />
                  <line x1='40' y1='180' x2='580' y2='180' stroke='#ccc' />

                  {stats.monthlySubmissionTrends.map((_, i) => (
                    <line key={`vline-${i}`} x1={40 + i * 50} y1={20} x2={40 + i * 50} y2={180} stroke='#f1f3f5' />
                  ))}

                  {[0, 20, 40, 60, 80, 100].map((y) => (
                    <text key={y} x='0' y={180 - y * 1.5} fontSize='10' fill='#999'>
                      {y}
                    </text>
                  ))}

                  {stats.monthlySubmissionTrends.map((m, i) => (
                    <text key={m.month} x={40 + i * 50} y={195} fontSize='10' textAnchor='middle' fill='#666'>
                      {m.month.slice(5)}
                    </text>
                  ))}

                  <polyline
                    fill='none'
                    stroke='#0d6efd'
                    strokeWidth='2'
                    points={stats.monthlySubmissionTrends
                      .map((m, i) => `${40 + i * 50},${180 - m.count * 1.5}`)
                      .join(' ')}
                  />

                  {stats.monthlySubmissionTrends.map((m, i) => (
                    <circle key={m.month} cx={40 + i * 50} cy={180 - m.count * 1.5} r='4' fill='#0d6efd' />
                  ))}
                </svg>
              </div>
            </div>
          )}

          {activeTab === 'EPA Distribution' && (
            <div className='d-flex flex-wrap gap-3'>
              {stats.epaDistribution.map((e) => (
                <div
                  key={e.epa}
                  className='border rounded p-3 shadow-sm flex-grow-1'
                  style={{ minWidth: '180px', maxWidth: '200px' }}
                >
                  <div className='fw-semibold mb-2'>EPA {e.epa}</div>
                  <svg width='100%' height='80' viewBox='0 0 100 40'>
                    <polyline fill='none' stroke='#0d6efd' strokeWidth='2' points='0,40 25,30 50,20 75,10 100,5' />
                    <circle cx='100' cy='5' r='2' fill='#0d6efd' />
                  </svg>
                  <div className='mt-2 text-muted small text-center'>Total: {e.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className='border rounded p-3 text-center flex-grow-1' style={{ minWidth: '150px' }}>
      <div className='fw-bold fs-5 text-dark'>{value}</div>
      <div className='text-muted small'>{label}</div>
    </div>
  );
}
