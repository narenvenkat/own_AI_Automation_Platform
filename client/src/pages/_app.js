import { useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { useAuthStore } from '../store/authStore.js';

export default function MyApp({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Head>
        <title>Agentflow AI - Agentic AI Operations Automation Platform</title>
        <meta
          name="description"
          content="Autonomous multi-agent orchestration platform. Turn plain text prompts into executable visual workflows with live agent timelines, self-healing recovery, and third-party integrations."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
