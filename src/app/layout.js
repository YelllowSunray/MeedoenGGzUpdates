import { CssBaseline } from '@mui/material';
import Navbar from "./components/navbar/navbar";
import { Inter, Cabin } from 'next/font/google';
import Script from 'next/script';
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
        <Navbar />
        {children}
        <Script id="chatbase-init" strategy="afterInteractive">
          {`
            if(!window.chatbase||window.chatbase("getState")!=="initialized"){
              window.chatbase=(...args)=>{
                if(!window.chatbase.q){
                  window.chatbase.q=[];
                }
                window.chatbase.q.push(args);
              };
              window.chatbase=new Proxy(window.chatbase,{
                get(target,prop){
                  if(prop==="q"){
                    return target.q;
                  }
                  return(...args)=>target(prop,...args);
                }
              });
            }
          `}
        </Script>
        <Script
          src="https://www.chatbase.co/embed.min.js"
          id="U0OQUa0_JtMHds3aK5-uy"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}