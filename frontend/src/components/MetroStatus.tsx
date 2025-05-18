'use client';
import React, { useState, useEffect } from 'react';
import { Alert, Grid, Table } from '@trussworks/react-uswds';
import { BusPosition } from '@/types/metro';
import { useSearchParams } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';

export default function MetroStatus() {
  const [busData, setBusData] = useState<BusPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const routeId = searchParams.get('routeid');
  const turnstileEnabled = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === 'true';

  const fetchBusData = async (turnstileToken?: string) => {
    if (!routeId) return;
    
    try {
      setLoading(true);
      
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/metro-status`);
      url.searchParams.append('routeid', routeId);

      const headers: Record<string, string> = {};
      if (turnstileToken) {
        headers['CF-Turnstile-Token'] = turnstileToken;
      }

      const response = await fetch(url.toString(), {
        headers
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

  useEffect(() => {
    if (!turnstileEnabled && routeId) {
      fetchBusData();
    }
  }, [routeId, turnstileEnabled]);

  const handleTurnstileSuccess = async (token: string) => {
    setTurnstileToken(token);
    await fetchBusData(token);
  };

  // Show landing page if no bus data received
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
      {turnstileEnabled && (
        <Grid row className="margin-bottom-2">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={handleTurnstileSuccess}
            options={{
              theme: 'light',
              appearance: 'always'
            }}
          />
        </Grid>
      )}
      {loading && (
        <Grid row>
          <Alert headingLevel="h4" type="info">Loading bus data...</Alert>
        </Grid>
      )}
      {error && (
        <Grid row>
          <Alert headingLevel="h4" type="error">{error}</Alert>
        </Grid>
      )}
      {(!turnstileEnabled || turnstileToken) && busData.length > 0 && (
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