import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import logo from '@/public/logo.png'; // Update the path to your logo

const header = () => {
  const router = useRouter();
  const { pathname } = router;

  return (
    <header className='bg-white text-gray-800 p-4 shadow-md'>
      <div className='container mx-auto flex justify-between items-center'>
        <Link href='/'>
          <a className='flex items-center'>
            <Image src={logo} alt='Logo' width={40} height={40} />
            <span className='ml-2 text-xl font-bold'>Clinical Competency Calculator</span>
          </a>
        </Link>
        <nav className='flex space-x-4'>
          <Link href='/dashboard'>
            <a className={`px-3 py-2 rounded ${pathname === '/dashboard' ? 'bg-gray-200' : ''}`}>Dashboard</a>
          </Link>
          <Link href='/form-requests'>
            <a className={`px-3 py-2 rounded ${pathname === '/form-requests' ? 'bg-gray-200' : ''}`}>Form Requests</a>
          </Link>
          <Link href='/report'>
            <a className={`px-3 py-2 rounded ${pathname === '/report' ? 'bg-gray-200' : ''}`}>Report</a>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default header;
