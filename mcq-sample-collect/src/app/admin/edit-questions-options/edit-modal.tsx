'use client';

import { cache, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import React from 'react';

import Loading from '@/components/loading';
import { getHistoricalMCQs } from '@/utils/get-epa-data';
import { createClient } from '@/utils/supabase/client';
import type { Tables } from '@/utils/supabase/database.types';
import type { MCQ } from '@/utils/types';

import { getUpdaterDetails, submitNewOption } from './actions';
import { renderOption, renderQuestion } from './render-spans';

const getCachedUpdaterDetails = cache(getUpdaterDetails);

export default function EditModal({
  mcqInformation,
  setMCQInformation,
  optionMCQ,
  optionKey,
  setOptionKey,
  optionText,
  newOptionText,
  setNewOptionText,
}: {
  mcqInformation: Tables<'mcqs_options'>[] | null;
  setMCQInformation: Dispatch<SetStateAction<Tables<'mcqs_options'>[] | null>>;
  optionMCQ: MCQ | null;
  optionKey: string | null;
  setOptionKey: Dispatch<SetStateAction<string | null>>;
  optionText: string | null;
  newOptionText: string | null;
  setNewOptionText: Dispatch<SetStateAction<string | null>>;
}) {
  type OptHistoryInstance = {
    updated_at: Date;
    updated_by: string;
    updater_display_name?: string | null;
    updater_email?: string | null;
    option: string;
  };

  const supabase = createClient();

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [optionHistory, setOptionHistory] = useState<OptHistoryInstance[] | null>(null);

  // on render, get historical MCQs
  useEffect(() => {
    (async () => setMCQInformation((await getHistoricalMCQs()) ?? null))();
    // add event listener when modal is closed
    document.getElementById('edit-modal')?.addEventListener('hide.bs.modal', () => {
      setOptionKey(null);
      if (document.getElementById('changes-list')?.classList.contains('show'))
        document.getElementById('changes-list-button')?.click();
    });
  }, [setMCQInformation, setOptionKey]);

  // on change of selected option, get historical change data
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      setOptionHistory(null);

      let history = mcqInformation?.map((mcqMeta) => ({
        updated_at: new Date(mcqMeta.updated_at),
        updated_by: mcqMeta.updated_by ?? '',
        option: (mcqMeta.data as MCQ[]).filter((mcq) => mcq.options[optionKey ?? ''])[0]?.options[optionKey ?? ''],
      }));

      const updaterIDs = Array.from(new Set(history?.map((h) => h.updated_by)));
      const updaterDetails = await Promise.all(
        updaterIDs?.map(async (id) => await getCachedUpdaterDetails(id ?? '')) ?? []
      );

      history = history?.map((h) => {
        const updater = updaterDetails?.find((u) => u?.id === h.updated_by);
        return {
          ...h,
          updater_display_name: updater?.display_name,
          updater_email: updater?.email,
        };
      });
      setOptionHistory(history ?? null);

      setLoadingHistory(false);
    };

    fetchHistory();
  }, [mcqInformation, optionKey, supabase]);

  const filterHistory = (history: OptHistoryInstance[]) => {
    if (history.length === 0) return history;
    const filtered = history.filter(
      (h, i) => (history[i + 1] && h.option !== history[i + 1].option) || i === history.length - 1
    );
    return filtered.length === 0 ? history.slice(history.length - 1) : filtered;
  };

  const handleSubmit = async () => {
    submitNewOption(optionKey!, newOptionText!);
    (async () => setMCQInformation((await getHistoricalMCQs()) ?? null))();
  };

  return (
    <div className='modal fade' id='edit-modal' tabIndex={-1} aria-labelledby='edit-modal-label' aria-hidden='true'>
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Edit option</h5>
            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
          </div>

          <div className='modal-body'>
            <p>
              <strong>Question:</strong>
              <br />
              {optionMCQ ? renderQuestion(optionMCQ.kf, optionMCQ.question) : ''}
            </p>

            <hr />

            <p>
              <strong>Old option:</strong>
              <br />
              {renderOption(optionKey ?? '', optionText ?? '')}
            </p>
            <p className='fw-bold mb-1'>New option:</p>
            <div className='mb-3'>
              <input
                id='new-option'
                className='form-control'
                type='text'
                placeholder='Option text'
                onChange={(e) => setNewOptionText(e.target.value)}
              />
            </div>

            <hr className='my-4' />

            <div className='accordion' id='changes'>
              <div className='accordion-item'>
                <h2 className='accordion-header' id='changes-heading'>
                  <button
                    className='accordion-button collapsed bg-body-secondary p-3'
                    id='changes-list-button'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#changes-list'
                    aria-expanded='false'
                    aria-controls='collapse'
                  >
                    Past changes to this option
                  </button>
                </h2>

                <div id='changes-list' className='accordion-collapse collapse' aria-labelledby='changes-heading'>
                  <div className='accordion-body p-0'>
                    {loadingHistory ? (
                      <div className='m-3'>
                        <Loading />
                      </div>
                    ) : (
                      <ul className='list-group list-group-flush rounded-bottom'>
                        {filterHistory(optionHistory ?? []).map((h, i) => (
                          <li className='list-group-item' key={i}>
                            <div className='mb-1'>
                              <span className='badge bg-body-secondary text-dark me-2'>
                                {h.updated_at.toLocaleDateString()}
                              </span>
                              <span className='badge bg-body-secondary text-dark'>
                                by {h.updater_display_name ?? h.updater_email ?? h.updated_by}
                              </span>
                            </div>
                            <div>{h.option}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='modal-footer'>
            <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>
              Cancel
            </button>
            <button
              type='button'
              className='btn btn-primary'
              data-bs-dismiss='modal'
              disabled={!optionMCQ || !optionKey || !optionText || !newOptionText || newOptionText === optionText}
              onClick={handleSubmit}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
