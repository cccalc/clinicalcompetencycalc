'use client';

import React, { useEffect, useState } from 'react';
import EPACard from './EPACard';
import EPAModal from './EPAModal';
import ToggleControl from '@/components/(StudentComponents)/ToggleControl';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';

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

type DevLevel = keyof typeof devLevelMap;


interface FormRequest {
  id: string;
  created_at: string;
  student_id: string;
}

interface FormResponses {
  response_id: string;
  request_id: string;
  form_requests: FormRequest;
}


interface FormResultsEntry {
  id: number;
  created_at: string;
  parent_response_id: string;
  results: Record<string, number>;
  form_responses: FormResponses;
}

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<EPA[]>([]);
  const [range, setRange] = useState<3 | 6 | 12>(3);
  const [selectedEpa, setSelectedEpa] = useState<EPA | null>(null);
  const { user, loading } = useUser();

  useEffect(() => {
    if (!user) return; 
    async function fetchData() {
      const { data, error } = await supabase
        .from('form_results')
        .select(`
          id,
          created_at,
          parent_response_id: response_id,
          results,
          form_responses!inner(
            response_id,
            request_id,
            form_requests!inner(
              id,
              created_at,
              student_id
            )
          )
        `)

        .filter('form_responses.form_requests.student_id', 'eq', user?.id || '');

      if (error) {
        console.error('Data Fetch Error:', error);
        return;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('No valid data found in form_results for this student');
        return;
      }

      const epaMap: Record<number, EPA> = {};

      (data as unknown as FormResultsEntry[]).forEach((entry) => {
        const { form_responses, created_at } = entry;

        if (
          entry.parent_response_id !== form_responses.response_id ||
          form_responses.request_id !== form_responses.form_requests.id
        ) {
          console.error('ID mismatch in joined data:', entry);
          return;
        }

        const parsedData = entry.results as Record<string, number>;
        Object.entries(parsedData).forEach(([key, value]) => {

          const [epaIdStr] = key.split('.');
          const epaId = parseInt(epaIdStr, 10);
          const kfId = key;


          const clampedLevel = Math.min(Math.round(value), 3);
          const levelName =
            (Object.keys(devLevelMap) as DevLevel[]).find(
              (lvl) => devLevelMap[lvl] === clampedLevel
            ) || 'none';

          if (!epaMap[epaId]) {
            epaMap[epaId] = { epa: epaId, keyFunctions: [] };
          }

          epaMap[epaId].keyFunctions.push({
            id: kfId,
            history: [
              {
                date: created_at,
                level: levelName,
              },
            ],
          });
        });
      });

      setData(Object.values(epaMap));
    }

    fetchData();
  }, [user]);

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
    const allGreen = scores.every((v) => v === devLevelMap.entrustable);
    const avg = Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length);
    return allGreen
      ? devLevelMap.entrustable
      : avg === devLevelMap.entrustable
      ? devLevelMap.developing
      : avg;
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
            onClick={(epa: EPA) => setSelectedEpa(epa)}
            getEPADevLevel={getEPADevLevel}
            getAverage={getAverage}
            range={range}
          />
        ))}
      </div>
      <EPAModal selectedEpa={selectedEpa} onClose={() => setSelectedEpa(null)} getAverage={getAverage} />
    </div>
  );
};

export default StudentDashboard;
