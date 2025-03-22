'use client';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

interface Position {
  lat: number;
  lng: number;
}

interface BusPosition {
  vehicleId: string;
  position: Position;
  routeId: string;
  direction: string;
  destination: string;
  deviation: number;
  lastUpdated: string;
}

interface BusMapProps {
  buses: BusPosition[];
}

const BusMap = ({ buses }: BusMapProps) => {
  const [selectedBus, setSelectedBus] = useState<BusPosition | null>(null);

  const mapCenter = {
    lat: 38.9072,
    lng: -77.0369
  };

  const busIcon = {
    url: 'https://maps.google.com/mapfiles/kml/shapes/bus.png',
    scaledSize: new google.maps.Size(30, 30),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(15, 15)
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px' }}
        center={mapCenter}
        zoom={12}
      >
        {buses.map((bus) => (
          <Marker
            key={bus.vehicleId}
            position={bus.position}
            onClick={() => setSelectedBus(bus)}
            icon={busIcon}
          />
        ))}
        
        {selectedBus && (
          <InfoWindow
            position={selectedBus.position}
            onCloseClick={() => setSelectedBus(null)}
          >
            <div>
              <h3>Bus {selectedBus.vehicleId}</h3>
              <p>Route: {selectedBus.routeId}</p>
              <p>Direction: {selectedBus.direction}</p>
              <p>Destination: {selectedBus.destination}</p>
              <p>Deviation: {selectedBus.deviation} minutes</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default BusMap;