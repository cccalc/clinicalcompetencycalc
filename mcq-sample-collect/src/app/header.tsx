import Image from 'next/image';

export default function Header({
  header,
  epa,
  kf,
}: {
  header: React.ReactNode;
  epa: string | undefined;
  kf: string | undefined;
}) {
  const WIDTH = 50;
  const HEIGHT = WIDTH * (16 / 21);

  return (
    <>
      <div className='bg-secondary text-center text-white p-3'>
        <div className='container'>
          <Image src='/ww-x-rect.svg' width={WIDTH} height={HEIGHT} alt='CCC Logo'></Image>
          <div>Clinical Competency Calculator</div>
        </div>
      </div>
      <div className='bg-secondary-subtle'>
        <div className='container' style={{maxWidth: '720px'}}>
          <div className='accordion accordion-flush' id='epa-kf-cont'>
            <div className='accordion-item'>
              <div className='accordion-header'>
                <button
                  className='accordion-button bg-secondary-subtle'
                  type='button'
                  data-bs-toggle='collapse'
                  data-bs-target='#epa-kf'
                  aria-expanded='true'
                  aria-controls='epa-kf'
                >
                  View EPA {epa} and Key Function {kf} details
                </button>
              </div>
              <div id='epa-kf' className='accordion-collapse collapse' data-bs-parent='#epa-kf-cont'>
                <div className='accordion-body bg-secondary-subtle pt-0'>{header}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
