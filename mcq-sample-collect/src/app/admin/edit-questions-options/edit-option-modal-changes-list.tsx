import Loading from '@/components/loading';
import type { OptHistoryInstance } from '@/utils/types';

export default function EditOptionModalChangesList({
  loadingHistory,
  optionHistory,
  filterHistory,
}: {
  loadingHistory: boolean;
  optionHistory: OptHistoryInstance[] | null;
  filterHistory: (history: OptHistoryInstance[]) => OptHistoryInstance[];
}) {
  return (
    <div className='accordion' id='changes'>
      <div className='accordion-item'>
        <h2 className='accordion-header' id='changes-heading'>
          <button
            className='accordion-button collapsed bg-body-secondary p-3'
            id='option-changes-list-button'
            type='button'
            data-bs-toggle='collapse'
            data-bs-target='#option-changes-list'
            aria-expanded='false'
            aria-controls='collapse'
          >
            Past changes to this option
          </button>
        </h2>

        <div id='option-changes-list' className='accordion-collapse collapse' aria-labelledby='changes-heading'>
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
  );
}
