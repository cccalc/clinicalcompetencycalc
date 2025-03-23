'use client';

<style jsx global>{`
  @media print {
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background: white;
    }

    .btn,
    .dropdown,
    .d-print-none,
    .cursor-pointer {
      display: none !important;
    }

    .card {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 2rem;
      box-shadow: none !important;
      border: 1px solid #ddd;
    }

    .card-body {
      padding: 1rem !important;
    }

    h5,
    h6 {
      color: black !important;
    }

    .table th,
    .table td {
      color: black !important;
    }
  }
`}</style>;

import React, { useEffect, useState } from 'react';
import LineGraph from '@/components/(StudentComponents)/LineGraph';
import HalfCircleGauge from '@/components/(StudentComponents)/HalfCircleGauge';
import { createClient } from '@/utils/supabase/client';

export type DevLevel = 0 | 1 | 2 | 3 | null;

export interface Assessment {
  epaId: number;
  keyFunctionId: string;
  devLevel: DevLevel;
  date: string;
  assessorId: string;
  comment?: string;
  setting?: string;
}

interface EPABoxProps {
  epaId: number;
  timeRange: 3 | 6 | 12;
}

const supabase = createClient();

const EPABox: React.FC<EPABoxProps> = ({ epaId, timeRange }) => {
  const [expanded, setExpanded] = useState(false);
  const [epaTitle, setEpaTitle] = useState('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    const fetchTitle = async () => {
      const { data, error } = await supabase.from('epa_kf_descriptions').select('epa_descriptions').single();
      if (data?.epa_descriptions) {
        setEpaTitle(data.epa_descriptions[epaId.toString()] || '');
      } else {
        console.error('EPA title fetch error:', error);
      }
    };
    fetchTitle();
  }, [epaId]);

  useEffect(() => {
    const generated = Array.from({ length: 60 }).map((_, i) => {
      const epaId = (i % 13) + 1;
      const keyFunctionId = `kf${(i % 5) + 1}`;
      const devLevel = Math.floor(Math.random() * 4) as DevLevel;
      const date = new Date(Date.now() - Math.random() * 31536000000).toISOString();
      const assessorId = `a${(i % 4) + 1}`;
      const comment = ['Great job', 'Needs improvement', 'Solid effort', 'N/A'][i % 4];
      const setting = ['Clinic', 'Inpatient', 'ED', 'Pediatrics'][i % 4];
      return { epaId, keyFunctionId, devLevel, date, assessorId, comment, setting };
    });

    setAssessments(generated);
  }, []);

  const now = new Date();
  const cutoff = new Date();
  cutoff.setMonth(now.getMonth() - timeRange);

  const filtered = assessments.filter((a) => a.epaId === epaId && new Date(a.date) >= cutoff);

  const devLevels = filtered.filter((a) => a.devLevel !== null) as {
    devLevel: number;
  }[];
  const avg =
    devLevels.length >= 3 ? Math.floor(devLevels.reduce((acc, cur) => acc + cur.devLevel, 0) / devLevels.length) : null;
  const allGreen = devLevels.length >= 3 && devLevels.every((d) => d.devLevel === 3);

  const comments = filtered.map((a) => a.comment).filter(Boolean);
  const settings = Array.from(new Set(filtered.map((a) => a.setting).filter(Boolean)));
  const assessors = Array.from(new Set(filtered.map((a) => a.assessorId)));
  const lastDate = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;
  const daysSinceLast = lastDate
    ? Math.floor((now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
    : 'N/A';

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
        <div className='card-body' style={{ background: '#fff' }}>
          <div className='row mb-4'>
            <div className='col-md-6'>
              <h6 className='fw-bold border-bottom pb-1'>Performance Over Time</h6>
              <LineGraph
                data={assessments
                  .filter((a) => a.epaId === epaId && a.devLevel !== null)
                  .map((a) => ({ date: a.date, value: a.devLevel! }))}
              />
            </div>
            <div className='col-md-6'>
              <h6 className='fw-bold border-bottom pb-1'>EPA Stats</h6>
              <ul className='list-group mb-3'>
                <li className='list-group-item'>Assessments: {devLevels.length}</li>
                <li className='list-group-item'>Days Since Last: {daysSinceLast}</li>
                <li className='list-group-item'>Assessors: {assessors.length}</li>
                <li className='list-group-item'>Settings: {settings.join(', ')}</li>
              </ul>
            </div>
          </div>

          <hr className='my-3' />

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
                {[...new Set(assessments.filter((a) => a.epaId === epaId).map((a) => a.keyFunctionId))]
                  .sort((a, b) => {
                    const nA = parseInt(a.replace(/\D/g, '') || '0');
                    const nB = parseInt(b.replace(/\D/g, '') || '0');
                    return nA - nB;
                  })
                  .map((kf) => {
                    const scores = filtered.filter((a) => a.keyFunctionId === kf && a.devLevel !== null);

                    const avg =
                      scores.length > 0
                        ? Math.floor(scores.reduce((sum, a) => sum + a.devLevel!, 0) / scores.length)
                        : 'Missing';

                    return (
                      <tr key={kf}>
                        <td>{kf}</td>
                        <td>
                          {avg === 'Missing'
                            ? '—'
                            : `${avg} - ${['Remedial', 'Early-Developing', 'Developing', 'Entrustable'][avg]}`}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <hr className='my-3' />

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

          <hr className='my-3' />

          <div>
            <h6 className='fw-bold border-bottom pb-1'>AI Summary & Recommendations</h6>
            <p className='text-muted'>
              <em>This section will provide autogenerated summaries and suggestions based on comments.</em>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPABox;
