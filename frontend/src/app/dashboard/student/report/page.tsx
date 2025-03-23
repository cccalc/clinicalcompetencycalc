// Entry file: /app/dashboard/student/report/page.tsx
'use client';

import { useState } from 'react';
import EPABox from '@/components/(StudentComponents)/EPABox';
import ToggleControl from '@/components/(StudentComponents)/ToggleControl';
import DownloadPDFButton from '@/components/(StudentComponents)/DownloadPDFButton';

const REPORT_EPAS = Array.from({ length: 13 }, (_, i) => i + 1); // EPA 1 to 13

const ReportPage = () => {
  const [timeRange, setTimeRange] = useState<3 | 6 | 12>(3);

  return (
    <main className='container-fluid px-5' style={{ backgroundColor: 'white' }}>
      <div className='mb-4'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <h1 className='d-print-none mb-0'>EPA Performance Report</h1>
          <p className='text-muted mb-3 d-none d-print-block print-section'>
            Showing data from the past {timeRange} months
          </p>
        </div>
        <div className='d-print-none d-flex justify-content-between align-items-center print-controls'>
          <ToggleControl selected={timeRange} onSelect={setTimeRange} />
          <DownloadPDFButton />
        </div>
      </div>
      <div className='print-section d-flex flex-column gap-4 mt-0'>
        {REPORT_EPAS.map((epaId) => (
          <EPABox key={epaId} epaId={epaId} timeRange={timeRange} />
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
            margin: 0 !important;
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
