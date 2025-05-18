'use client';
import React from 'react';
import Head from 'next/head';
import MetroStatus from '../components/MetroStatus';
import { GridContainer } from '@trussworks/react-uswds';

export default function Home() {
  return (
    <>
      <Head>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        />
      </Head>
      <div className="usa-app">
        <header className="usa-header usa-header--basic">
          <div className="usa-nav-container">
            <div className="usa-navbar">
              <div className="usa-logo">
                <em className="usa-logo__text">
                  DC Metro Status
                </em>
              </div>
            </div>
          </div>
        </header>
        <main className="usa-section padding-top-2">
          <GridContainer>
            <MetroStatus />
          </GridContainer>
        </main>
      </div>
    </>
  );
}