// import { Geist, Geist_Mono } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import BootstrapClient from '@/components/bootstrap-client';
import { UserProvider } from '../context/UserContext';
import Header from '@/components/header';

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Clinical Competency Calculator',
  description: 'An application for calculating clinical competency',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <UserProvider>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              zIndex: 1030,
              backgroundColor: 'white',
              borderBottom: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Header />
          </div>
          <div className='main-content'>{children}</div>
        </UserProvider>
      </body>
      <BootstrapClient />
    </html>
  );
}
