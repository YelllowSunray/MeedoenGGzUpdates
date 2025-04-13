import { CssBaseline } from '@mui/material';
import NavbarWrapper from './components/navbar/NavbarWrapper';
import { Inter, Cabin } from 'next/font/google';
import './globals.css';

// Initialize the Cabin font
const cabin = Cabin({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cabin',
});

export const metadata = {
  title: 'Activiteiten Zoeker',
  description: 'Vind sociale en welzijnsactiviteiten in jouw buurt',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl" className={cabin.variable}>
      <body className={cabin.className}>
        <CssBaseline />
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}