'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import BusMap from './BusMap';

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
  const [routeId, setRouteId] = useState<string>('');

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/metro-status`);
        if (routeId) {
          url.searchParams.append('routeid', routeId);
        }
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
  }, [routeId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bus Tracker</h1>
      <div className="mb-4">
        <input
          type="text"
          value={routeId}
          onChange={(e) => setRouteId(e.target.value)}
          placeholder="Enter Route ID (optional)"
          className="p-2 border rounded"
        />
      </div>
      <BusMap buses={busData} />
    </div>
  );
} 