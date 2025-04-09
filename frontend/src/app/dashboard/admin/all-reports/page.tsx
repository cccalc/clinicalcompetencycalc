'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getEPAKFDescs } from '@/utils/get-epa-data';
import EPABox from '@/components/(StudentComponents)/EPABox';
import DownloadPDFButton from '@/components/(StudentComponents)/DownloadPDFButton';

const supabase = createClient();

interface Student {
  id: string;
  display_name: string;
}

interface StudentReport {
  id: string;
  user_id: string;
  title: string;
  time_window: '3m' | '6m' | '12m';
  report_data: Record<string, number>;
  llm_feedback: string | null;
  created_at: string;
}

interface FormResult {
  response_id: string;
  created_at: string;
  results: Record<string, number>;
}

const REPORT_EPAS = Array.from({ length: 13 }, (_, i) => i + 1);

export default function AdminAllReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
  const [kfDescriptions, setKfDescriptions] = useState<Record<string, string[]> | null>(null);
  const [timeRange, setTimeRange] = useState<3 | 6 | 12>(3);
  const [title, setTitle] = useState<string>('');
  const [editingEPA, setEditingEPA] = useState<number | null>(null);
  const [formResults, setFormResults] = useState<FormResult[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'student');
      const ids = roles?.map((r) => r.user_id) ?? [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ids)
        .eq('account_status', 'Active');

      const mapped = (profiles ?? []).map((p) => ({
        id: p.id,
        display_name: p.display_name ?? 'Unnamed Student',
      }));

      setStudents(mapped);
    };

    fetchStudents();
  }, []);

  const fetchReports = useCallback(async (studentId: string) => {
    const { data } = await supabase
      .from('student_reports')
      .select('*')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false });

    if (data) setReports(data);
  }, []);

  const fetchFormResults = useCallback(async () => {
    if (!selectedStudent) return;

    const { data: requests } = await supabase.from('form_requests').select('id').eq('student_id', selectedStudent.id);

    const requestIds = requests?.map((r) => r.id) ?? [];

    const { data: responses } = await supabase
      .from('form_responses')
      .select('response_id')
      .in('request_id', requestIds);

    const responseIds = responses?.map((r) => r.response_id) ?? [];

    const { data } = await supabase.from('form_results').select('*').in('response_id', responseIds);

    if (data) setFormResults(data);
  }, [selectedStudent]);

  const handleGenerate = async () => {
    if (!selectedStudent) return;
    await supabase.rpc('generate_report', {
      student_id_input: selectedStudent.id,
      time_range_input: timeRange,
      report_title: title || `Admin Generated (${timeRange}m)`,
    });
    fetchReports(selectedStudent.id);
  };

  useEffect(() => {
    const fetchKF = async () => {
      const descs = await getEPAKFDescs();
      if (descs?.kf_desc) {
        const grouped: Record<string, string[]> = {};
        for (const key in descs.kf_desc) {
          const [epaIdRaw] = key.split('-');
          const epaId = String(parseInt(epaIdRaw, 10));
          if (!grouped[epaId]) grouped[epaId] = [];
          grouped[epaId].push(descs.kf_desc[key]);
        }
        setKfDescriptions(grouped);
      }
    };
    fetchKF();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const result of formResults) {
      await supabase.from('form_results').update({ results: result.results }).eq('response_id', result.response_id);
    }
    setSaving(false);
    setEditingEPA(null);
  };

  return (
    <div className='container py-5'>
      <style>{`
        @media print {
          .d-print-none {
            display: none !important;
          }
        }
      `}</style>

      <h1 className='mb-4 d-print-none'>All Student Reports (Admin)</h1>

      {/* Student Picker */}
      <div className='d-print-none'>
        <div className='mb-3'>
          <label className='form-label'>Select Student</label>
          <select
            className='form-select'
            value={selectedStudent?.id || ''}
            onChange={(e) => {
              const s = students.find((s) => s.id === e.target.value);
              setSelectedStudent(s ?? null);
              setSelectedReport(null);
              setReports([]);
              if (s) fetchReports(s.id);
            }}
          >
            <option value=''>-- Select Student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.display_name}
              </option>
            ))}
          </select>
        </div>

        <div className='d-flex gap-3 align-items-end mb-4'>
          <div>
            <label className='form-label'>Time Range</label>
            <select
              className='form-select'
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value) as 3 | 6 | 12)}
            >
              {[3, 6, 12].map((m) => (
                <option key={m} value={m}>
                  {m} months
                </option>
              ))}
            </select>
          </div>
          <div className='flex-grow-1'>
            <label className='form-label'>Report Title</label>
            <input
              type='text'
              className='form-control'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Enter report title'
            />
          </div>
          <button className='btn btn-success' onClick={handleGenerate} disabled={!selectedStudent}>
            Generate Report
          </button>
        </div>
      </div>

      {/* Report list */}
      {selectedStudent && reports.length > 0 && (
        <div className='mb-4 d-print-none'>
          <h5>Past Reports for {selectedStudent.display_name}</h5>
          <ul className='list-group'>
            {reports.map((r) => (
              <li
                key={r.id}
                className='list-group-item list-group-item-action'
                onClick={() => setSelectedReport(r)}
                style={{ cursor: 'pointer' }}
              >
                {r.title} ({r.time_window}) – {new Date(r.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Report view */}
      {selectedStudent && selectedReport && (
        <div className='mt-4 p-4 rounded border bg-light'>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h3>{selectedReport.title}</h3>
            <DownloadPDFButton />
          </div>

          {REPORT_EPAS.map((epaId) => (
            <div key={epaId} className='mb-5'>
              <div className='d-flex justify-content-end'>
                <button
                  className='btn btn-outline-primary btn-sm d-print-none'
                  onClick={async () => {
                    setEditingEPA(epaId);
                    await fetchFormResults();
                  }}
                >
                  Edit EPA {epaId}
                </button>
              </div>

              <EPABox
                epaId={epaId}
                timeRange={parseInt(selectedReport.time_window) as 3 | 6 | 12}
                kfDescriptions={kfDescriptions}
                studentId={selectedStudent.id}
              />

              {/* Editor */}
              {editingEPA === epaId && (
                <div className='mt-3 p-3 border rounded bg-white'>
                  <h6 className='mb-3'>Edit Key Function Levels for EPA {epaId}</h6>

                  {formResults.map((res) => {
                    const entries = Object.entries(res.results).filter(([key]) => key.startsWith(`${epaId}.`));
                    if (entries.length === 0) return null;

                    return (
                      <div key={res.response_id} className='mb-4'>
                        <h6 className='text-muted'>{new Date(res.created_at).toLocaleString()}</h6>
                        <div className='row'>
                          {entries.map(([key, val]) => {
                            const [epaStr, kfStr] = key.split('.');
                            const epaKey = String(epaStr);
                            const kfIndex = parseInt(kfStr, 10) - 1;
                            const label = kfDescriptions?.[epaKey]?.[kfIndex] ?? `Key Function ${key}`;

                            return (
                              <div key={key} className='col-md-4 mb-3'>
                                <label className='form-label'>
                                  KF {key}
                                  <br />
                                  <small className='text-muted'>{label}</small>
                                </label>
                                <select
                                  className='form-select'
                                  value={Math.floor(Number(val))}
                                  onChange={(e) => {
                                    const newVal = parseInt(e.target.value, 10);
                                    setFormResults((prev) =>
                                      prev.map((r) =>
                                        r.response_id === res.response_id
                                          ? {
                                              ...r,
                                              results: { ...r.results, [key]: newVal },
                                            }
                                          : r
                                      )
                                    );
                                  }}
                                >
                                  {[0, 1, 2, 3].map((n) => (
                                    <option key={n} value={n}>
                                      {n} – {['Remedial', 'Early-Developing', 'Developing', 'Entrustable'][n]}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <button className='btn btn-primary mt-3' onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
