import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '@/components/ccc-logo-color.svg'; // Update the path to your logo

const Header = () => {
  const pathname = usePathname();

  return (
    <header className='bg-white text-gray-800 p-4 shadow-md'>
      <div className='container mx-auto d-flex justify-content-between align-items-center'>
        <Link href='/' className='d-flex align-items-center text-decoration-none'>
          <Image src={logo} alt='Logo' width={40} height={40} />
          <span className='ms-2 fs-4 fw-bold'>Clinical Competency Calculator</span>
        </Link>
        <nav className='d-flex gap-3'>
          <Link
            href='/dashboard'
            className={`btn ${pathname === '/dashboard' ? 'btn-secondary' : 'btn-outline-secondary'}`}
          >
            Dashboard
          </Link>
          <Link
            href='/form-requests'
            className={`btn ${pathname === '/form-requests' ? 'btn-secondary' : 'btn-outline-secondary'}`}
          >
            Form Requests
          </Link>
          <Link href='/report' className={`btn ${pathname === '/report' ? 'btn-secondary' : 'btn-outline-secondary'}`}>
            Report
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
