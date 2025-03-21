import { useState, useEffect } from 'react';
import { MetroLine } from '@/types/metro';

export default function MetroStatus() {
  const [metroData, setMetroData] = useState<MetroLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetroData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metro-status`);
        const data = await response.json();
        setMetroData(data);
      } catch (err) {
        setError('Failed to fetch metro data');
      } finally {
        setLoading(false);
      }
    };

    fetchMetroData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Metro Status</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metroData.map((line) => (
          <div key={line.id} className="p-4 border rounded-lg shadow">
            <h2 className="font-semibold">{line.name}</h2>
            <p className="mt-2">Status: {line.status}</p>
            <p>Next arrival: {line.nextArrival}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 