'use client';

import React, { useEffect, useState } from 'react';
import EPACard from './EPACard';
import EPAModal from './EPAModal';
import ToggleControl from '@/components/(StudentComponents)/ToggleControl';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface HistoryEntry {
  date: string;
  level: string;
}

interface KeyFunction {
  id: string;
  history: HistoryEntry[];
}

interface EPA {
  epa: number;
  title?: string;
  keyFunctions: KeyFunction[];
}

const devLevelMap: Record<string, number> = {
  remedial: 0,
  'early-developing': 1,
  developing: 2,
  entrustable: 3,
};

const generateDummyData = (): EPA[] => {
  const now = new Date();
  const monthsAgo = (n: number) => new Date(now.getFullYear(), now.getMonth() - n, now.getDate());

  return Array.from({ length: 13 }, (_, i) => ({
    epa: i + 1,
    keyFunctions: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, k) => ({
      id: `kf-${i + 1}-${k}`,
      history: Array.from({ length: Math.floor(Math.random() * 6) + 1 }, () => ({
        date: new Date(monthsAgo(Math.floor(Math.random() * 12))).toISOString(),
        level: ['remedial', 'early-developing', 'developing', 'entrustable'][Math.floor(Math.random() * 4)],
      })),
    })),
  }));
};

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<EPA[]>([]);
  const [range, setRange] = useState<3 | 6 | 12>(3);
  const [selectedEpa, setSelectedEpa] = useState<EPA | null>(null);

  useEffect(() => {
    async function fetchData() {
      const dummy = generateDummyData();

      const { data: epaData, error: epaError } = await supabase.from('epa_kf_descriptions').select('*');
      if (epaError) {
        console.error('EPA Fetch Error:', epaError);
        setData(dummy);
        return;
      }

      const formattedEPAs = Object.entries(epaData[0].epa_descriptions).map(([key, value]) => ({
        id: parseInt(key, 10),
        description: value as string,
      }));

      const withTitles = dummy.map((epa) => {
        const match = formattedEPAs.find((entry) => entry.id === epa.epa);
        return {
          ...epa,
          title: match?.description ?? '',
        };
      });

      setData(withTitles);
    }

    fetchData();
  }, []);

  const getAverage = (kf: KeyFunction): number | null => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - range);
    const recent = kf.history.filter((h) => new Date(h.date) >= cutoff && h.level !== 'none');
    if (recent.length < 1) return null;
    const avg = recent.reduce((sum, h) => sum + devLevelMap[h.level], 0) / recent.length;
    return Math.floor(avg);
  };

  const getEPADevLevel = (kfList: KeyFunction[]): number | null => {
    const scores = kfList.map(getAverage).filter((v): v is number => v !== null);
    if (scores.length < 3) return null;
    const allGreen = scores.every((v) => v === 3);
    const avg = Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length);
    return allGreen ? 3 : avg === 3 ? 2 : avg;
  };

  return (
    <div className='container mt-4'>
      <div className='d-flex justify-content-center mb-4 gap-2'>
        <ToggleControl selected={range} onSelect={setRange} />
      </div>
      <div className='row'>
        {data.map((epa) => (
          <EPACard
            key={epa.epa}
            epa={epa}
            onClick={setSelectedEpa}
            getEPADevLevel={getEPADevLevel}
            getAverage={getAverage}
          />
        ))}
      </div>
      <EPAModal selectedEpa={selectedEpa} onClose={() => setSelectedEpa(null)} getAverage={getAverage} />
    </div>
  );
};

export default StudentDashboard;
