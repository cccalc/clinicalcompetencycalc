'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getLatestMCQs } from '@/utils/get-epa-data';
import { useSearchParams } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';

const supabase = createClient();

// ----------------------
// Types
// ----------------------

/**
 * Represents a single EPA description record.
 */
interface EPA {
  id: number;
  description: string;
}

interface KeyFunction {
  kf: string;
  epa: number;
  question: string; 

  options: { [key: string]: string };
}

 */
  // ----------------------
interface FormRequest {
  student_id: string;
  completed_by: string;
  clinical_settings: string;
  notes: string;
  goals: string;
  display_name?: string;
  email?: string;
}

type Responses = {
  [epa: number]: {
    [kf: string]: { [optionKey: string]: boolean | string } & { text?: string[] }
  }
};

function sortResponsesAscending(src: Responses): Responses {
    .map(Number)
          for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
  const [epas, setEPAs] = useState<EPA[]>([]);
  const [kfData, setKFData] = useState<KeyFunction[]>([]);
  const [selectedEPAs, setSelectedEPAs] = useState<number[]>([]);
  const [completedEPAs, setCompletedEPAs] = useState<{ [key: number]: boolean }>({});
  const [currentEPA, setCurrentEPA] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionCollapsed, setSelectionCollapsed] = useState(false);
  const [textInputs, setTextInputs] = useState<{ [epa: number]: { [instanceKey: string]: string } }>({});

  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');
  console.log('Form ID:', studentId);

  // ----------------------
  interface FormRequest {
    created_at: string;
    student_id: string;
    completed_by: string;
    clinical_settings: string;
    notes: string;
  useEffect(() => {
    async function fetchFormRequestDetails() {
      if (!studentId) return;
      const { data: formData, error: formError } = await supabase
        .from('form_requests')
        .select('*')
        .eq('id', studentId)
        .single();
      if (formError || !formData) {
        console.error('Failed to fetch form request:', formError?.message);
        return;
      }
      const { data: users, error: userError } = await supabase.rpc('fetch_users');
      if (userError) {
        console.error('Failed to fetch users:', userError.message);
        return;
      }
      const student = users.find((u: { user_id: string }) => u.user_id === formData.student_id);
      const fr: FormRequest = {
        ...formData,
        display_name: student?.display_name || 'Unknown',
        email: student?.email || 'Unknown',
      });
      };
      setFormRequest(fr);
    }
    fetchFormRequestDetails();
  }, [studentId]);

  useEffect(() => {
    async function fetchCachedJSON() {
      if (!formRequest) return;
      const filePath = `responses/${formRequest.id}.json`;
      const { data, error } = await supabase.storage.from('form-responses').download(filePath);
          metadata: { student_id: formRequest.student_id, rater_id: formRequest.completed_by },
        try {
          const parsed = JSON.parse(text);
        } catch (err) {
          console.error('Error parsing cached JSON:', err);
          setCachedJSON({
            metadata: { student_id: formRequest.student_id, rater_id: formRequest.completed_by },
            response: {},
          });
        }
    fetchCachedJSON();
  }, [formRequest]);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data: epaData, error: epaError } = await supabase.from('epa_kf_descriptions').select('*');
      if (epaError) {
        console.error('EPA Fetch Error:', epaError);
      } else if (epaData && epaData.length > 0) {
        const formattedEPAs = Object.entries(epaData[0].epa_descriptions).map(
          ([key, value]) => ({
            id: parseInt(key, 10),
            description: value as string,
          })
        );
        setEPAs(formattedEPAs);
      }

      const latestMCQs = await getLatestMCQs();
      if (latestMCQs) {
        const formattedKFData: KeyFunction[] = latestMCQs.map((mcq: any) => ({
          ...mcq,
          epa: parseInt(mcq.epa, 10),

          question: mcq.question,
        }));
        setKFData(formattedKFData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);


  const toggleEPASelection = (epaId: number) => {
    setSelectedEPAs((prev) => (prev.includes(epaId) ? prev.filter((id) => id !== epaId) : [...prev, epaId]));
    setSelectedEPAs((prev) =>
      prev.includes(epaId) ? prev.filter((id) => id !== epaId) : [...prev, epaId]
  };

  /**
  const toggleSelectionCollapse = () => {
    setSelectionCollapsed(!selectionCollapsed);
  };

  const submitEPAs = () => {
    if (selectedEPAs.length > 0) {
      setCurrentEPA(selectedEPAs[0]);
      setSelectionCollapsed(true);
    }
  };

   * @param {number} epaId - The EPA ID to mark as completed
  const handleOptionChange = (
    kfId: string,
    optionKey: string,
  ) => {
    setResponses((prev) => {
      const epaResponses = prev[epaId] || {};
      const kfResponses = epaResponses[kfId] || {};
      return {
        ...prev,
        [epaId]: { ...epaResponses, [kfId]: { ...kfResponses, [optionKey]: value } },
      };
    });
  };

  const handleTextInputChange = (
    epaId: number,
    compKey: string,
    value: string
  ) => {
        [epaId]: { ...prevEpa, [compKey]: value },
  const handleTextInputBlur = (epaId: number, kfId: string, instanceIndex: number) => {
    const compKey = `${kfId}-${instanceIndex}`;
    setResponses((prev) => {
      const epaResponses = prev[epaId] || {};
      const kfResponses = epaResponses[kfId] || {};
      let textArray: string[] = Array.isArray(kfResponses.text) ? [...kfResponses.text] : [];
      textArray[instanceIndex] = currentValue;
      return {
        ...prev,
        [epaId]: {
          ...epaResponses,
          [kfId]: { ...kfResponses, text: textArray },
        },
      };
    });

    setTextInputs((prev) => {
      const prevEpa = prev[epaId] || {};
      const newKFState = { ...(prevEpa[kfId] || {}) };
      newKFState[compKey] = '';
      return {
        ...prev,
        [epaId]: { ...prevEpa, [kfId]: newKFState },
      };
    });
  };

  async function updateJSONFile() {
    if (!formRequest) {
      console.error('Form request is not available.');
      return;
    }
    const filePath = `responses/${formRequest.id}.json`;
    const sortedResponse = sortResponsesAscending(responses);
    const localData = cachedJSON
      ? { ...cachedJSON }
      : {
          metadata: {
            student_id: formRequest.student_id,
            rater_id: formRequest.completed_by,
          },
          response: {},
        };
    localData.response = sortedResponse;
    setCachedJSON(localData);
    const fileContent = JSON.stringify(localData, null, 2);
    const { error } = await supabase.storage
      .from('form-responses')
      .upload(filePath, fileContent, { upsert: true });
    if (error) {
      console.error('Error updating JSON file:', error.message);
    } else {
      console.log('JSON file updated successfully.');
    }
  }

  const handleFormCompletion = (epaId: number) => {
    setCompletedEPAs((prev) => ({ ...prev, [epaId]: true }));
    updateJSONFile();
  };

  //
  // Render
  //
  return (
    <div className='container-fluid d-flex'>
      {/* Sidebar */}
      <div className='col-md-3 bg-light p-4 border-end'>
        <h3 className='mb-3'>Selected EPAs</h3>
        <ul className='list-group'>
          {selectedEPAs.length === 0 ? (
            <li className='list-group-item'>No EPAs selected</li>
          ) : (
            [...selectedEPAs]
              .sort((a, b) => a - b)
              .map((epaId) => (
                <li
                  key={epaId}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    currentEPA === epaId ? 'active' : ''
                  }`}
                  onClick={() => setCurrentEPA(epaId)}
                  data-bs-toggle='tooltip'
                  data-bs-placement='right'
                  title={epas.find((e) => e.id === epaId)?.description || ''}
                  style={{ cursor: 'pointer' }}
                >
                  <span className='badge bg-primary me-2'>EPA {epaId}</span>
                  <span className='text-truncate' style={{ maxWidth: '150px' }}>
                    {epas.find((e) => e.id === epaId)?.description || ''}
                  </span>
                  <span className={`badge bg-${completedEPAs[epaId] ? 'success' : 'danger'}`}>
                    {completedEPAs[epaId] ? '✔' : '❌'}
                  </span>
                </li>
              ))
          )}
        </ul>
      </div>

      {/* Main Content */}
      <div className='col-md-9 p-4'>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
            {formRequest && (
              <div className='card p-3 mb-4 shadow-sm bg-light'>
                <div className='row'>
                  <div className='col-md-4'>
                    <h5 className='fw-bold mb-1'>{formRequest.display_name}</h5>
                    <p className='text-muted mb-1'>{formRequest.email}</p>
                    <p className='text-muted mb-0'>Setting: {formRequest.clinical_settings || 'N/A'}</p>
                    <small className='text-muted'>
                  </div>
                  <div className='col-md-4 border-start'>
                    <div className='text-secondary fw-bold mb-1'>Relevant Activity:</div>
                    <span>{formRequest.notes || 'No notes provided'}</span>
                  </div>
                  <div className='col-md-4 border-start'>
                    <div className='text-secondary fw-bold mb-1'>Stated Goals:</div>
                    <span>{formRequest.goals || 'No goals provided'}</span>
                  </div>
                </div>
              </div>
            )}
            {/* EPA Selection Panel */}
            {selectionCollapsed ? (
              <button className='btn btn-secondary mb-3' onClick={toggleSelectionCollapse}>
                Modify EPA Selection
              </button>
            ) : (
              <>
                <h2 className='mb-3'>Select EPAs for Evaluation</h2>
                <div className='d-flex flex-wrap gap-2'>
                  {epas.length === 0 ? (
                    <p>No EPAs available.</p>
                  ) : (
                    epas.map((epa) => (
                      <button
                        key={epa.id}
                        style={{
                          minWidth: '150px',
                        }}
                        onClick={() => toggleEPASelection(epa.id)}
                      >
                        <span className='badge bg-primary me-2'>EPA {epa.id}</span>
                        {epa.description}
                      </button>
                    ))
                  )}
                </div>
                <button className='btn btn-success mt-3' onClick={submitEPAs} disabled={selectedEPAs.length === 0}>
                  Submit Selection
                </button>
              </>
            )}
          </>
        )}

        {/* Key Function Form Display */}
        {currentEPA !== null && (
          <div key={currentEPA} className='card mt-4'>
            <div className='card-header bg-primary text-white'>
              {epas.find((e) => e.id === currentEPA)?.description || 'EPA Not Found'}
            </div>
            <div className='card-body'>
              {kfData
                .filter((kf) => kf.epa === currentEPA)
                .map((kf, i) => (
                  <div key={i} className='mb-4'>
                    <p className='fw-bold'>{kf.question}</p>
                    <div className='row'>
                      {Object.entries(kf.options).map(([key, option]) => (
                          <div className='form-check'>
                            <input className='form-check-input' type='checkbox' id={key} />
                            <label className='form-check-label' htmlFor={key}>
                              {option}
                .map((kf, instanceIndex) => {

                  const compKey = `${kf.kf}-${instanceIndex}`;

                  const currentText =
                    (textInputs[currentEPA] &&
                      <p className='fw-bold'>{kf.question}</p>
                      <div className='row'>
                        {Object.entries(kf.options).map(([optionKey, optionLabel]) => (
                          <div key={optionKey} className='col-md-6 mb-2'>
                            <div className='form-check'>
                                htmlFor={`epa-${currentEPA}-kf-${kf.kf}-option-${optionKey}`}
                          </div>
                        </div>
                          placeholder='Additional comments ...'
                          value={currentText}
                          onChange={(e) =>
                            handleTextInputChange(currentEPA, compKey, e.target.value)
                          onBlur={() =>
                        ></textarea>
                      </div>
                      <hr />
                    </div>
                    <textarea className='form-control mt-2' placeholder='Additional comments...'></textarea>
                    <hr />
                  </div>
                ))}
                  );
                })}
              <button
                className='btn btn-success mt-3'
                onClick={() => currentEPA && handleFormCompletion(currentEPA)}
                Mark as Completed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
