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

/**
 * Represents a key function question associated with an EPA.
 */
interface KeyFunction {
  kf: string;
  epa: number;
  question: string;
  options: { [key: string]: string };
}

/**
 * RaterFormsPage Component
 *
 * Allows raters to:
 * - Select EPAs for evaluation
 * - Answer multiple-choice key function questions for each EPA
 * - Toggle between selection and evaluation views
 */
export default function RaterFormsPage() {
  // ----------------------
  // State Management
  // ----------------------

  const [epas, setEPAs] = useState<EPA[]>([]);
  const [kfData, setKFData] = useState<KeyFunction[]>([]);
  const [selectedEPAs, setSelectedEPAs] = useState<number[]>([]);
  const [completedEPAs, setCompletedEPAs] = useState<{ [key: number]: boolean }>({});
  const [currentEPA, setCurrentEPA] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionCollapsed, setSelectionCollapsed] = useState(false);

  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');
  console.log('Form ID:', studentId);

  // ----------------------
  // Initial Data Fetch
  // ----------------------

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

  const [formRequest, setFormRequest] = useState<FormRequest | null>(null);

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
      setFormRequest({
        ...formData,
        display_name: student?.display_name || 'Unknown',
        email: student?.email || 'Unknown',
      });
    }

    fetchFormRequestDetails();
  }, [studentId]);

  useEffect(() => {
    /**
     * Fetches EPA descriptions and MCQ data on component mount.
     */
    async function fetchData() {
      setLoading(true);

      // Fetch EPA descriptions
      const { data: epaData, error: epaError } = await supabase.from('epa_kf_descriptions').select('*');
      if (epaError) {
        console.error('EPA Fetch Error:', epaError);
      } else {
        const formattedEPAs = Object.entries(epaData[0].epa_descriptions).map(([key, value]) => ({
          id: parseInt(key, 10),
          description: value as string,
        }));
        setEPAs(formattedEPAs);
      }

      // Fetch latest multiple-choice key function questions
      const latestMCQs = await getLatestMCQs();
      if (latestMCQs) {
        const formattedKFData = latestMCQs.map((mcq) => ({
          ...mcq,
          epa: parseInt(mcq.epa, 10),
        })) as KeyFunction[];
        setKFData(formattedKFData);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // ----------------------
  // Event Handlers
  // ----------------------

  /**
   * Adds or removes an EPA from the selected list.
   * @param {number} epaId - The EPA ID to toggle
   */
  const toggleEPASelection = (epaId: number) => {
    setSelectedEPAs((prev) => (prev.includes(epaId) ? prev.filter((id) => id !== epaId) : [...prev, epaId]));
  };

  /**
   * Collapses or expands the EPA selection section.
   */
  const toggleSelectionCollapse = () => {
    setSelectionCollapsed(!selectionCollapsed);
  };

  /**
   * Submits selected EPAs and shows the form for the first one.
   */
  const submitEPAs = () => {
    if (selectedEPAs.length > 0) {
      setCurrentEPA(selectedEPAs[0]);
      setSelectionCollapsed(true);
    }
  };

  /**
   * Marks an EPA as completed in local state.
   * @param {number} epaId - The EPA ID to mark as completed
   */
  const handleFormCompletion = (epaId: number) => {
    setCompletedEPAs((prev) => ({ ...prev, [epaId]: true }));
  };

  // ----------------------
  // Render
  // ----------------------

  return (
    <div className='container-fluid d-flex'>
      {/* Sidebar: Selected EPA Navigation */}
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

      {/* Main Content: EPA Selection and Question Forms */}
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
                    <small className='text-muted'>{new Date(formRequest.created_at).toLocaleString()}</small>
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
                        className={`btn ${
                          selectedEPAs.includes(epa.id) ? 'btn-primary' : 'btn-outline-secondary'
                        } text-start`}
                        style={{
                          minWidth: '150px',
                          maxWidth: '300px',
                          whiteSpace: 'wrap',
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
                        <div key={key} className='col-md-6 mb-2'>
                          <div className='form-check'>
                            <input className='form-check-input' type='checkbox' id={key} />
                            <label className='form-check-label' htmlFor={key}>
                              {option}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <textarea className='form-control mt-2' placeholder='Additional comments...'></textarea>
                    <hr />
                  </div>
                ))}
              <button className='btn btn-success mt-3' onClick={() => handleFormCompletion(currentEPA)}>
                Mark as Completed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
