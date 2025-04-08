'use client';

import React, { useEffect, useState } from 'react';
import LineGraph from '@/components/(StudentComponents)/LineGraph';
import HalfCircleGauge from '@/components/(StudentComponents)/HalfCircleGauge';
import { createClient } from '@/utils/supabase/client';

export type DevLevel = 0 | 1 | 2 | 3 | null;

interface KeyFunctionResponse {
  text?: string[];
  [key: string]: boolean | string[] | undefined;
}

interface EPAResponse {
  [kfId: string]: KeyFunctionResponse;
}

interface FullResponseStructure {
  response?: {
    [epaId: string]: EPAResponse;
  };
}

interface FormResponsesInner {
  response?: FullResponseStructure;
  form_requests: {
    student_id: string;
    clinical_settings?: string;
  };
}

interface SupabaseRow {
  created_at: string;
  results: Record<string, number>;
  form_responses: FormResponsesInner;
}

interface StudentReportRow {
  created_at: string;
  time_window: string;
  title: string;
  report_data: Record<string, number>;
  llm_feedback?: string | null;
}

interface Assessment {
  epaId: number;
  keyFunctionId: string;
  devLevel: DevLevel;
  date: string;
  setting?: string | null;
}

interface EPABoxProps {
  epaId: number;
  timeRange: 3 | 6 | 12;
  kfDescriptions?: Record<string, string[]> | null;
  studentId: string;
}

const supabase = createClient();

const EPABox: React.FC<EPABoxProps> = ({ epaId, timeRange, kfDescriptions, studentId }) => {
  const [expanded, setExpanded] = useState(false);
  const [epaTitle, setEpaTitle] = useState('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [llmFeedback, setLlmFeedback] = useState<string | null>(null);
  const [lifetimeAverage, setLifetimeAverage] = useState<number | null>(null);

  useEffect(() => {
    const fetchTitle = async () => {
      const { data } = await supabase.from('epa_kf_descriptions').select('epa_descriptions').single();
      if (data?.epa_descriptions) {
        setEpaTitle(data.epa_descriptions[epaId.toString()] || '');
      }
    };
    fetchTitle();
  }, [epaId]);

  useEffect(() => {
    const fetchAssessments = async () => {
      const { data, error } = await supabase
        .from('form_results')
        .select(
          `
          created_at,
          results,
          form_responses:form_responses!form_results_response_id_fkey (
            response,
            form_requests:form_requests!form_responses_request_id_fkey (
              student_id,
              clinical_settings
            )
          )
        `
        )
        .returns<SupabaseRow[]>();

      if (error || !data) {
        console.error('Error fetching assessment data:', error);
        return;
      }

      const parsedAssessments: Assessment[] = [];
      const parsedComments: string[] = [];

      for (const row of data) {
        const formResponse = row.form_responses;
        if (formResponse?.form_requests?.student_id !== studentId) continue;

        const date = row.created_at;
        const setting = formResponse.form_requests?.clinical_settings || null;

        for (const [kfKey, level] of Object.entries(row.results)) {
          const [epaStr, kfNum] = kfKey.split('.');
          if (parseInt(epaStr) === epaId) {
            parsedAssessments.push({
              epaId: parseInt(epaStr),
              keyFunctionId: `kf${kfNum}`,
              devLevel: level as DevLevel,
              date,
              setting,
            });
          }
        }

        const commentBlock = formResponse.response?.response?.[String(epaId)];
        if (commentBlock) {
          Object.values(commentBlock).forEach((kfObj) => {
            if (kfObj && typeof kfObj === 'object' && 'text' in kfObj) {
              const texts = (kfObj as KeyFunctionResponse).text;
              if (Array.isArray(texts)) {
                parsedComments.push(...texts.filter((t) => typeof t === 'string' && t.trim() !== ''));
              }
            }
          });
        }
      }

      setAssessments(parsedAssessments);
      setComments(parsedComments);
    };

    const fetchReport = async () => {
      const { data: reports, error } = await supabase
        .from('student_reports')
        .select('*')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false });

      if (!error && reports && reports.length > 0) {
        const recent = reports[0] as StudentReportRow;
        const epaKey = String(epaId);
        if (recent.report_data[epaKey] !== undefined) {
          setLifetimeAverage(recent.report_data[epaKey]);
        }
        setLlmFeedback(recent.llm_feedback || null);
      }
    };

    fetchAssessments();
    fetchReport();
  }, [epaId, studentId]);

  const now = new Date();
  const cutoff = new Date();
  cutoff.setMonth(now.getMonth() - timeRange);

  const filtered = assessments.filter((a) => new Date(a.date) >= cutoff);
  const devLevels = filtered.filter((a) => a.devLevel !== null) as { devLevel: number }[];

  const avg =
    devLevels.length >= 3 ? Math.floor(devLevels.reduce((acc, cur) => acc + cur.devLevel, 0) / devLevels.length) : null;

  const allGreen = devLevels.length >= 3 && devLevels.every((d) => d.devLevel === 3);
  const settings = Array.from(new Set(filtered.map((a) => a.setting).filter(Boolean)));
  const lastDate = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;
  const daysSinceLast = lastDate
    ? Math.floor((now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
    : 'N/A';

  const groupedByMonth = assessments
    .filter((a) => a.devLevel !== null)
    .reduce((acc, a) => {
      const month = new Date(a.date).toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(a.devLevel as number);
      return acc;
    }, {} as Record<string, number[]>);

  const lineGraphData = Object.entries(groupedByMonth)
    .map(([month, levels]) => ({
      date: month + '-01',
      value: Math.round(levels.reduce((sum, v) => sum + v, 0) / levels.length),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className={`card rounded shadow-sm ${expanded ? 'expanded' : ''}`}>
      <div
        className='card-header d-flex justify-content-between align-items-center'
        onClick={() => setExpanded((prev) => !prev)}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <h5 className='mb-0'>
            EPA {epaId}: {epaTitle}
          </h5>
        </div>
        <HalfCircleGauge average={avg} allGreen={allGreen} />
      </div>

      {expanded && (
        <div className='card-body'>
          <div className='row mb-4'>
            <div className='col-md-6'>
              <h6 className='fw-bold border-bottom pb-1'>Performance Over Time</h6>
              <LineGraph data={lineGraphData} />
            </div>
            <div className='col-md-6'>
              <h6 className='fw-bold border-bottom pb-1'>EPA Stats</h6>
              <ul className='list-group mb-3'>
                <li className='list-group-item'>Assessments: {devLevels.length}</li>
                <li className='list-group-item'>Days Since Last: {daysSinceLast}</li>
                <li className='list-group-item'>Settings: {settings.join(', ')}</li>
                <li className='list-group-item'>
                  Lifetime Average:{' '}
                  {lifetimeAverage !== null
                    ? `${['Remedial', 'Early-Developing', 'Developing', 'Entrustable'][Math.floor(lifetimeAverage)]}`
                    : '—'}
                </li>
              </ul>
            </div>
          </div>

          <div className='mb-4'>
            <h6 className='fw-bold border-bottom pb-1'>Key Functions</h6>
            <table className='table table-sm table-bordered'>
              <thead className='table-light'>
                <tr>
                  <th>Key Function</th>
                  <th>Avg Level</th>
                </tr>
              </thead>
              <tbody>
                {(kfDescriptions?.[String(epaId)] || []).map((label, index) => {
                  const kfId = `kf${index + 1}`;
                  const scores = filtered.filter((a) => a.keyFunctionId === kfId && a.devLevel !== null);
                  const avgKF =
                    scores.length > 0
                      ? Math.floor(scores.reduce((sum, a) => sum + (a.devLevel ?? 0), 0) / scores.length)
                      : '—';

                  return (
                    <tr key={kfId}>
                      <td className='text-wrap' style={{ maxWidth: '300px' }}>
                        {label}
                      </td>
                      <td>
                        {avgKF === '—'
                          ? '—'
                          : `${['Remedial', 'Early-Developing', 'Developing', 'Entrustable'][avgKF]}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className='mb-4'>
            <h6 className='fw-bold border-bottom pb-1'>Comments</h6>
            <ul className='list-group'>
              {comments.length > 0 ? (
                comments.map((c, i) => (
                  <li key={i} className='list-group-item'>
                    {c}
                  </li>
                ))
              ) : (
                <li className='list-group-item'>No comments found</li>
              )}
            </ul>
          </div>

          <div>
            <h6 className='fw-bold border-bottom pb-1'>AI Summary & Recommendations</h6>
            <p className='text-muted'>{llmFeedback || <em>No AI feedback available for this EPA.</em>}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPABox;
