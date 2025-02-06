import Image from 'next/image';
import {MCQ} from '@/data/types';

export default function Header({header}: {header: React.ReactNode}) {
  const WIDTH = 70;
  const HEIGHT = WIDTH * (16 / 21);

  return (
    <div className='text-center'>
      <div className='bg-secondary text-white p-3'>
        <div className='container'>
          <Image src='/ww-x-rect.svg' width={WIDTH} height={HEIGHT} alt='CCC Logo'></Image>
          <div>Clinical Competency Calculator</div>
        </div>
      </div>
      <div className='bg-secondary-subtle p-3'>
        <div className='container'>{header}</div>
      </div>
    </div>
  );
}
