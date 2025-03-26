export interface BusPosition {
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
  