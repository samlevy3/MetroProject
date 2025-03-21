from typing import Dict, List

from flask import Flask, jsonify, current_app, request
from flask_cors import CORS
import os
import requests
from dataclasses import dataclass
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load environment variables
METRO_API_URL = os.getenv("METRO_API_URL", "default_url_here")
METRO_KEY = os.getenv("METRO_KEY")

@dataclass
class BusPosition:
    VehicleID: str
    Lat: float
    Lon: float
    Deviation: float
    DateTime: str
    RouteID: str
    DirectionText: str
    TripHeadsign: str


@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy"})


@app.route("/api/metro-status")
def get_metro_status():
    route_id = request.args.get('routeid')
    try:
        if not METRO_KEY:
            current_app.logger.error("METRO_KEY environment variable not set")
            return jsonify({"error": "API key not configured"}), 500

        headers = {
            "X-Api-Key": METRO_KEY,
            "Content-Type": "application/json"
        }

        url = f"{METRO_API_URL}/Bus/BusPositions"
        if route_id:
            url += f"?RouteID={route_id}"

        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx, 5xx)

        data = response.json()
        bus_positions = []
        
        for bus in data.get('BusPositions', []):
            bus_positions.append({
                'vehicleId': bus['VehicleID'],
                'position': {
                    'lat': bus['Lat'],
                    'lng': bus['Lon']
                },
                'routeId': bus['RouteID'],
                'direction': bus['DirectionText'],
                'destination': bus['TripHeadsign'],
                'deviation': bus['Deviation'],
                'lastUpdated': bus['DateTime']
            })

        return jsonify(bus_positions), 200

    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Error fetching metro data: {str(e)}")
        return jsonify({"error": "Failed to fetch metro data"}), 500


if __name__ == "__main__":
    app.run(debug=False, port=5000)
