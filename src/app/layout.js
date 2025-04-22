import { CssBaseline } from '@mui/material';
import NavbarWrapper from './components/navbar/NavbarWrapper';
import Footer from './components/Footer';
import { Cabin } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import SessionAnalyticsWrapper from './components/SessionAnalyticsWrapper';

// Initialize the Cabin font with minimal configuration
const cabin = Cabin({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Meedoen in Hilversum',
  description: 'Vind activiteiten en organisaties in Hilversum',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className={cabin.className}>
        <CssBaseline />
        <NavbarWrapper />
        {children}
        <Footer />
        <SessionAnalyticsWrapper />
        <Script id="chatbase-script" strategy="afterInteractive">
          {`
            (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="U0OQUa0_JtMHds3aK5-uy";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
          `}
        </Script>
      </body>
    </html>
  );
}