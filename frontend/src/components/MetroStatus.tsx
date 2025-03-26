'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { Alert, Grid, Table } from '@trussworks/react-uswds';

interface BusPosition {
  vehicleId: string;
  position: {
    lat: number;
    lng: number;
  };
  routeId: string;
  direction: string;
  destination: string;
  deviation: number;
  lastUpdated: string;
}

export default function MetroStatus() {
  const [busData, setBusData] = useState<BusPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/metro-status`);
        const response = await fetch(url.toString());
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
  }, []);

  if (loading) return <Alert headingLevel="h4" type="info">Loading...</Alert>
  if (error) return <Alert headingLevel="h4" type="error">{error}</Alert>

  return (
    <div>
      <Grid row>
        <h1 className="usa-heading">Bus Tracker</h1>      
      </Grid>
      <Grid row>
        <Table bordered fullWidth>
          <thead>
            <tr>
              <th scope="col">Route</th>
              <th scope="col">Direction</th>
              <th scope="col">Destination</th>
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
                <td>{bus.deviation}</td>
                <td>{new Date(bus.lastUpdated).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Grid>
    </div>
  );
} 