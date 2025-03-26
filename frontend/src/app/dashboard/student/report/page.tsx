// Entry file: /app/dashboard/student/report/page.tsx
'use client';

import { useState, useEffect } from 'react';
import EPABox from '@/components/(StudentComponents)/EPABox';
import ToggleControl from '@/components/(StudentComponents)/ToggleControl';
import DownloadPDFButton from '@/components/(StudentComponents)/DownloadPDFButton';
import { getEPAKFDescs } from '@/utils/get-epa-data';

const REPORT_EPAS = Array.from({ length: 13 }, (_, i) => i + 1); // EPA 1 to 13

const ReportPage = () => {
  const [timeRange, setTimeRange] = useState<3 | 6 | 12>(3);
  const [kfDescriptions, setKfDescriptions] = useState<Record<string, string[]> | null>(null);

  useEffect(() => {
    const fetchDescriptions = async () => {
      const descs = await getEPAKFDescs();
      if (descs?.kf_desc) {
        const grouped: Record<string, string[]> = {};
        for (const key in descs.kf_desc) {
          const [epaIdRaw] = key.split('-');
          const epaId = String(parseInt(epaIdRaw, 10)); // Normalize key
          if (!grouped[epaId]) grouped[epaId] = [];
          grouped[epaId].push(descs.kf_desc[key]);
        }
        setKfDescriptions(grouped);
      }
    };
    fetchDescriptions();
  }, []);

  return (
    <main className='container-fluid px-5' style={{ backgroundColor: 'white' }}>
      <div className='d-print-none mb-4'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <h1 className='mb-0'>EPA Performance Report</h1>
        </div>
        <p className='text-muted mb-3 d-none d-print-block'>Showing data from the past {timeRange} months</p>
        <div className='d-flex justify-content-between align-items-center d-print-none'>
          <ToggleControl selected={timeRange} onSelect={setTimeRange} />
          <div className='d-flex gap-2'>
            <DownloadPDFButton />
          </div>
        </div>
      </div>

      <div className='print-section d-flex flex-column gap-4 mt-0'>
        {REPORT_EPAS.map((epaId) => (
          <EPABox key={epaId} epaId={epaId} timeRange={timeRange} kfDescriptions={kfDescriptions} />
        ))}
      </div>

      <style jsx global>{`
        @media print {
          header,
          .d-print-none {
            display: none !important;
          }

          .print-section {
            margin-top: 0 !important;
            padding-top: 0 !important;
            page-break-before: avoid;
            break-before: avoid;
          }

          main.container-fluid {
            margin-top: 0 !important;
            padding: 0 2rem !important;
          }

          .card {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .card-header {
            page-break-after: avoid;
          }

          h1,
          h5,
          h6 {
            page-break-after: avoid;
          }

          .list-group-item {
            break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
};

export default ReportPage;
