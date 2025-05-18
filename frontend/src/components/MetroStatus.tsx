'use client';
import React, { useEffect, useState } from 'react';
import { Alert, Grid, Table } from '@trussworks/react-uswds';
import { BusPosition } from '@/types/metro';
import { useSearchParams } from 'next/navigation';

export default function MetroStatus() {
  const [busData, setBusData] = useState<BusPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const routeId = searchParams.get('routeid');

  useEffect(() => {
    // Wait for turnstile to be available
    const renderTurnstile = () => {
      // @ts-ignore
      if (typeof window.turnstile === 'undefined') {
        setTimeout(renderTurnstile, 100);
        return;
      }

      const container = document.getElementById('turnstile-widget');
      if (!container) {
        setTimeout(renderTurnstile, 100);
        return;
      }

      // @ts-ignore
      window.turnstile.render(container, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        callback: (token: string) => {
          setTurnstileToken(token);
        },
        appearance: 'always',
      });
    };

    renderTurnstile();
  }, []);

  useEffect(() => {
    const fetchBusData = async () => {
      if (!routeId || !turnstileToken) {
        return;
      }
      setLoading(true);
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/metro-status`);
        url.searchParams.append('routeid', routeId);
        
        const response = await fetch(url.toString(), {
          headers: {
            'CF-Turnstile-Token': turnstileToken
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch bus data');
        }
        const data = await response.json();
        setBusData(data);
      } catch (err) {
        setError('Failed to fetch bus data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusData();
  }, [routeId, turnstileToken]);

  if (loading) return <Alert headingLevel="h4" type="info">Loading...</Alert>
  if (error) return <Alert headingLevel="h4" type="error">{error}</Alert>

  // Show landing page if no routeId is provided
  if (!routeId) {
    return (
      <div className="padding-4">
        <Grid row>
          <h1 className="usa-heading">DC Metro Bus Tracker</h1>
        </Grid>
        <Grid row>
          <Alert type="info" headingLevel="h4">
            Please add a route ID to the URL to view bus information.
            <br />
            Example: <code>?routeid=L2</code>
          </Alert>
        </Grid>
      </div>
    );
  }

  // Show bus data table when routeId is present
  return (
    <div>
      <Grid row>
        <h1 className="usa-heading">Bus Tracker - Route {routeId}</h1>      
      </Grid>
      <Grid row className="margin-bottom-2">
        <div 
          id="turnstile-widget" 
          className="margin-bottom-2"
          role="region" 
          aria-label="Human verification"
        ></div>
      </Grid>
      {turnstileToken && (
        <Grid row>
          <Table bordered fullWidth>
            <thead>
              <tr>
                <th scope="col">Route</th>
                <th scope="col">Direction</th>
                <th scope="col">Destination</th>
                <th scope="col">Latitude</th>
                <th scope="col">Longitude</th>
                <th scope="col">Deviation</th>
                <th scope="col">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {busData.map((bus) => (
                <tr key={bus.vehicleId}>
                  <th scope="row">{bus.routeId}</th>
                  <td>{bus.direction}</td>
                  <td>{bus.destination}</td>
                  <td>{bus.position.lat.toFixed(4)}</td>
                  <td>{bus.position.lng.toFixed(4)}</td>
                  <td>{bus.deviation}</td>
                  <td>{new Date(bus.lastUpdated).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Grid>
      )}
    </div>
  );
}