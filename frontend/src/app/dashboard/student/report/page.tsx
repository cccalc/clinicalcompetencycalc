'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import EPABox from '@/components/(StudentComponents)/EPABox';
import DownloadPDFButton from '@/components/(StudentComponents)/DownloadPDFButton';
import ReportGenerationForm from '@/components/(StudentComponents)/ReportGenerationForm';
import { createClient } from '@/utils/supabase/client';
import { getEPAKFDescs } from '@/utils/get-epa-data';

const supabase = createClient();

interface StudentReport {
  id: string;
  user_id: string;
  title: string;
  time_window: '3m' | '6m' | '12m';
  report_data: Record<string, number>;
  llm_feedback: string | null;
  created_at: string;
}

const REPORT_EPAS = Array.from({ length: 13 }, (_, i) => i + 1); // EPA 1 to 13

const ReportPage = () => {
  const { user, loading } = useUser();
  const [timeRange, setTimeRange] = useState<3 | 6 | 12>(3);
  const [kfDescriptions, setKfDescriptions] = useState<Record<string, string[]> | null>(null);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDescriptions = async () => {
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

    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('student_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setReports(data as StudentReport[]);
    };

    fetchDescriptions();
    fetchReports();
  }, [user]);

  const handleGenerated = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('student_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data as StudentReport[]);
      setSelectedReport(data[0] as StudentReport);
    }
  };

  if (loading) return <p>Loading user...</p>;
  if (!user) return <p>Please sign in to view reports.</p>;

  return (
    <main className='container-fluid px-5' style={{ backgroundColor: 'white' }}>
      {!selectedReport ? (
        <>
          <div className='mb-4'>
            <ReportGenerationForm studentId={user.id} onGenerated={handleGenerated} />
          </div>

          <h5 className='mb-3'>Past Reports</h5>
          {reports.length === 0 ? (
            <p className='text-muted'>No reports found.</p>
          ) : (
            <ul className='list-group mb-4'>
              {reports.map((report) => (
                <li
                  key={report.id}
                  className='list-group-item list-group-item-action'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedReport(report);
                    setTimeRange(parseInt(report.time_window) as 3 | 6 | 12);
                  }}
                >
                  {report.title} ({report.time_window}) – {new Date(report.created_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <div className='d-print-none mb-4'>
            <button className='btn btn-outline-secondary' onClick={() => setSelectedReport(null)}>
              Back to Report List
            </button>
          </div>

          <div className='d-print-none mb-4'>
            <div className='d-flex justify-content-between align-items-center mb-2'>
              <h1 className='mb-0'>EPA Performance Report</h1>
            </div>
            <p className='text-muted mb-3 d-none d-print-block'>Showing data from the past {timeRange} months</p>
            <div className='d-flex justify-content-between align-items-center d-print-none'>
              <DownloadPDFButton />
            </div>
          </div>

          <div className='print-section d-flex flex-column gap-4 mt-0'>
            {REPORT_EPAS.map((epaId) => (
              <EPABox
                key={epaId}
                epaId={epaId}
                timeRange={timeRange}
                kfDescriptions={kfDescriptions}
                studentId={user.id}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default ReportPage;
