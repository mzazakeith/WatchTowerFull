import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WatchTower - Enhanced Service Monitoring System',
  description: 'A robust monitoring system designed to track the health and performance of web services, APIs, and server resources.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
} 