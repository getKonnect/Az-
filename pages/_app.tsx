import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Ephesis&display=swap" rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,600&family=Jost:wght@200;300;400&display=swap"
          rel="stylesheet"
        />
        {/* Quick FOUC-fix: reveal server HTML if hydration/error prevents JS from running */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.querySelectorAll('[data-next-hide-fouc]').forEach(el=>el.remove());
                window.addEventListener('load', ()=>document.querySelectorAll('[data-next-hide-fouc]').forEach(el=>el.remove()));
              } catch(e) {}
            `,
          }}
        />
        <title>Azra</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
