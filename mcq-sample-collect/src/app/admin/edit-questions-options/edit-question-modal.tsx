'use client';

import { cache, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import React from 'react';

import { getHistoricalMCQs } from '@/utils/get-epa-data';
import { createClient } from '@/utils/supabase/client';
import type { Tables } from '@/utils/supabase/database.types';
import type { MCQ, OptHistoryInstance } from '@/utils/types';

import { getUpdaterDetails, submitNewOption } from './actions';
import { renderOption, renderQuestion } from './render-spans';
import EditOptionModalChangesList from './edit-option-modal-changes-list';

const getCachedUpdaterDetails = cache(getUpdaterDetails);

export default function EditOptionModal({
  mcqInformation,
  optionMCQ,
  optionKey,
  optionText,
  newOptionText,
}: {
  mcqInformation: {
    get: Tables<'mcqs_options'>[] | null;
    set: Dispatch<SetStateAction<Tables<'mcqs_options'>[] | null>>;
  };
  optionMCQ: {
    get: MCQ | null;
    set: Dispatch<SetStateAction<MCQ | null>>;
  };
  optionKey: {
    get: string | null;
    set: Dispatch<SetStateAction<string | null>>;
  };
  optionText: {
    get: string | null;
    set: Dispatch<SetStateAction<string | null>>;
  };
  newOptionText: {
    get: string | null;
    set: Dispatch<SetStateAction<string | null>>;
  };
}) {
  const supabase = createClient();

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [optionHistory, setOptionHistory] = useState<OptHistoryInstance[] | null>(null);

  useEffect(() => {
    // add event listener when modal is closed
    document.getElementById('edit-option-modal')?.addEventListener('hide.bs.modal', () => {
      optionKey.set(null);
      if (document.getElementById('option-changes-list')?.classList.contains('show'))
        document.getElementById('option-changes-list-button')?.click();
    });
  }, [optionKey]);

  // on change of selected option, get historical change data
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      setOptionHistory(null);

      if (optionKey.get === null) {
        setLoadingHistory(false);
        return;
      }

      let history = mcqInformation.get?.map((mcqMeta) => ({
        updated_at: new Date(mcqMeta.updated_at),
        updated_by: mcqMeta.updated_by ?? '',
        option: (mcqMeta.data as MCQ[]).filter((mcq) => mcq.options[optionKey.get ?? ''])[0]?.options[
          optionKey.get ?? ''
        ],
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
    submitNewOption(optionKey.get!, newOptionText.get!);
    (async () => mcqInformation.set((await getHistoricalMCQs()) ?? null))();
  };

  return (
    <div
      className='modal fade'
      id='edit-option-modal'
      tabIndex={-1}
      aria-labelledby='edit-option-modal-label'
      aria-hidden='true'
    >
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1 className='modal-title h5' id='edit-option-modal-label'>
              Edit option
            </h1>
            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' />
          </div>

          <div className='modal-body'>
            <p>
              <strong>Question:</strong>
              <br />
              {optionMCQ.get ? renderQuestion(optionMCQ.get.kf, optionMCQ.get.question) : ''}
            </p>

            <hr />

            <p>
              <strong>Old option:</strong>
              <br />
              {renderOption(optionKey.get ?? '', optionText.get ?? '')}
            </p>
            <p className='fw-bold mb-1'>New option:</p>
            <div className='mb-3'>
              <input
                id='new-option'
                className='form-control'
                type='text'
                placeholder='Option text'
                onChange={(e) => newOptionText.set(e.target.value)}
              />
            </div>

            <hr className='my-4' />

            <EditOptionModalChangesList
              loadingHistory={loadingHistory}
              optionHistory={optionHistory}
              filterHistory={filterHistory}
            />
          </div>

          <div className='modal-footer'>
            <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>
              Cancel
            </button>
            <button
              type='button'
              className='btn btn-primary'
              data-bs-dismiss='modal'
              disabled={
                !optionMCQ.get ||
                !optionKey.get ||
                !optionText.get ||
                !newOptionText.get ||
                newOptionText.get === optionText.get
              }
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
