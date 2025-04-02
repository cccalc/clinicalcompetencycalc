'use client';

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { createClient } from '@/utils/supabase/client';
import { getLatestMCQs } from '@/utils/get-epa-data';
import { useSearchParams } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
 
const supabase = createClient(); 

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

interface FormRequest {
  id: string;
  created_at: string;
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
    [kf: string]: { [optionKey: string]: boolean | string } & { text?: string[] };
  };
};

function sortResponsesAscending(src: Responses): Responses {
  const sorted: Responses = {} as Responses;
  Object.keys(src)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((epaKey) => {
      const kfObj = src[epaKey];
      const sortedKF: { [kf: string]: { [optionKey: string]: boolean | string } & { text?: string[] } } = {};
      Object.keys(kfObj)
        .sort((a, b) => {
          const partsA = a.split('.').map(Number);
          const partsB = b.split('.').map(Number);
          for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const diff = (partsA[i] || 0) - (partsB[i] || 0);
            if (diff !== 0) return diff;
          }
          return 0;
        })
        .forEach((kfKey) => {
          sortedKF[kfKey] = kfObj[kfKey];
        });
      sorted[epaKey] = sortedKF;
    });
  return sorted;
}

export default function RaterFormsPage() {
  const [epas, setEPAs] = useState<EPA[]>([]);
  const [kfData, setKFData] = useState<KeyFunction[]>([]);
  const [selectedEPAs, setSelectedEPAs] = useState<number[]>([]);
  const [completedEPAs, setCompletedEPAs] = useState<{ [epa: number]: boolean }>({});
  const [currentEPA, setCurrentEPA] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionCollapsed, setSelectionCollapsed] = useState(false);
  const [formRequest, setFormRequest] = useState<FormRequest | null>(null);
  const [responses, setResponses] = useState<Responses>({});
  const [cachedJSON, setCachedJSON] = useState<{ metadata: { student_id: string; rater_id: string }; response: Responses } | null>(null);
  const [textInputs, setTextInputs] = useState<{ [epa: number]: { [instanceKey: string]: string } }>({});
  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');

  const saveProgress = useCallback(
    (newResponses: Responses, newTextInputs: { [epa: number]: { [instanceKey: string]: string } }) => {
      const debouncedSave = debounce(() => {
        const formProgress: { responses: Responses; textInputs: { [epa: number]: { [instanceKey: string]: string } } } = {
          responses: newResponses,
          textInputs: newTextInputs,
        };
        localStorage.setItem(`form-progress-${studentId}`, JSON.stringify(formProgress));
      }, 500);
      debouncedSave();
    },
    [studentId]
  );

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
      };
      setFormRequest(fr);
    }
    fetchFormRequestDetails();
  }, [studentId]);

  useEffect(() => {
    async function fetchCachedJSON() {
      if (!formRequest) return;
      if (!cachedJSON) {
        setCachedJSON({
          metadata: { student_id: formRequest.student_id, rater_id: formRequest.completed_by },
          response: {},
        });
      }
    }
    fetchCachedJSON();
  }, [formRequest, cachedJSON]);

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
        const formattedKFData: KeyFunction[] = latestMCQs.map((mcq: { epa: string; kf: string; question: string; options: { [key: string]: string } }) => ({
          kf: mcq.kf,
          epa: parseInt(mcq.epa, 10),
          question: mcq.question,
          options: mcq.options,
        }));
        setKFData(formattedKFData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const cachedData = localStorage.getItem(`form-progress-${studentId}`);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      setResponses(parsedData.responses || {});
      setTextInputs(parsedData.textInputs || {});
    }
  }, [studentId]);

  useEffect(() => {
    saveProgress(responses, textInputs);
  }, [responses, textInputs, saveProgress]);

  const toggleEPASelection = (epaId: number) => {
    setSelectedEPAs((prev) => (prev.includes(epaId) ? prev.filter((id) => id !== epaId) : [...prev, epaId]));
  };

  const toggleSelectionCollapse = () => {
    setSelectionCollapsed(!selectionCollapsed);
  };

  const submitEPAs = () => {
    if (selectedEPAs.length > 0) {
      setCurrentEPA(selectedEPAs[0]);
      setSelectionCollapsed(true);
    }
  };

  const handleOptionChange = (epaId: number, kfId: string, optionKey: string, value: boolean) => {
    setResponses((prev) => {
      const epaResponses = prev[epaId] || {};
      const kfResponses = epaResponses[kfId] || {};
      return {
        ...prev,
        [epaId]: {
          ...epaResponses,
          [kfId]: {
            ...kfResponses,
            [optionKey]: value,
          },
        },
      };
    });
  };

  const handleTextInputChange = (epaId: number, compKey: string, value: string) => {
    setTextInputs((prev) => {
      const prevEpa = prev[epaId] || {};
      return {
        ...prev,
        [epaId]: {
          ...prevEpa,
          [compKey]: value,
        },
      };
    });
  };

  async function finalSubmit() {
    if (!formRequest) {
      console.error('Form request is not available.');
      return;
    }

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

    const { error } = await supabase
      .from('form_responses')
      .insert({
        request_id: formRequest.id,
        response: localData,
      });

    if (error) {
      console.error('Error submitting full JSON:', error.message);
    } else {
      console.log('Full JSON submitted successfully.');

      localStorage.removeItem(`form-progress-${formRequest.id}`);
      console.log('Cache cleared for form:', formRequest.id);
    }
  }

  const handleFormCompletion = (epaId: number) => {
    setCompletedEPAs((prev) => ({ ...prev, [epaId]: true }));
    saveProgress(responses, textInputs);
  };
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
        <div className="mt-4">
          <button className='btn btn-primary w-100' onClick={finalSubmit}>
            Submit
          </button>
        </div>
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
                    <p className='text-muted mb-0'>
                      Setting: {formRequest.clinical_settings || 'N/A'}
                    </p>
                    <small className='text-muted'>
                      {new Date(formRequest.created_at).toLocaleString()}
                    </small>
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
                        className={`btn ${selectedEPAs.includes(epa.id) ? 'btn-primary' : 'btn-outline-secondary'} text-start`}
                        style={{ minWidth: '150px', maxWidth: '300px', whiteSpace: 'wrap' }}
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
                .map((kf, instanceIndex) => {
                  const compKey = `${kf.kf}-${instanceIndex}`;
                  const currentText =
                    (textInputs[currentEPA] && textInputs[currentEPA][compKey]) || '';
                  return (
                    <div key={compKey} className='mb-4'>
                      <p className='fw-bold'>{kf.question}</p>
                      <div className='row'>
                        {Object.entries(kf.options).map(([optionKey, optionLabel]) => (
                          <div key={optionKey} className='col-md-6 mb-2'>
                            <div className='form-check'>
                              <input
                                className='form-check-input'
                                type='checkbox'
                                id={`epa-${currentEPA}-kf-${kf.kf}-option-${optionKey}`}
                                name={`epa-${currentEPA}-kf-${kf.kf}-${optionKey}`}
                                checked={
                                  !!(
                                    responses[currentEPA] &&
                                    responses[currentEPA][kf.kf] &&
                                    responses[currentEPA][kf.kf][optionKey]
                                  )
                                }
                                onChange={(e) =>
                                  handleOptionChange(currentEPA, kf.kf, optionKey, e.target.checked)
                                }
                              />
                              <label
                                className='form-check-label'
                                htmlFor={`epa-${currentEPA}-kf-${kf.kf}-option-${optionKey}`}
                              >
                                {optionLabel}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h6>Additional comments:</h6>
                        <textarea
                          className='form-control'
                          placeholder='Additional comments ...'
                          value={currentText}
                          onChange={(e) =>
                            handleTextInputChange(currentEPA, compKey, e.target.value)
                          }
                        ></textarea>
                      </div>
                      <hr />
                    </div>
                  );
                })}
              <button
                className='btn btn-success mt-3'
                onClick={() => currentEPA && handleFormCompletion(currentEPA)}
              >
                Mark as Completed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
