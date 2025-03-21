import os
from dataclasses import dataclass

import requests
from dotenv import load_dotenv
from flask import Flask, current_app, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

load_dotenv()

# Load environment variables
METRO_API_URL = os.getenv("METRO_API_URL", "default_url_here")
METRO_KEY = os.getenv("METRO_KEY")


@dataclass
class Position:
    lat: float
    lng: float


@dataclass
class BusPosition:
    VehicleID: str
    position: Position
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
    route_id = request.args.get("routeid")
    try:
        if not METRO_KEY:
            current_app.logger.error("METRO_KEY environment variable not set")
            return jsonify({"error": "API key not configured"}), 500

        headers = {"api_key": METRO_KEY, "Content-Type": "application/json"}

        url = f"{METRO_API_URL}"
        if route_id:
            url += f"?RouteID={route_id}"

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx, 5xx)

        data = response.json()
        bus_positions = []

        for bus in data.get("BusPositions", []):
            bus_positions.append(
                {
                    "vehicleId": bus["VehicleID"],
                    "position": {"lat": bus["Lat"], "lng": bus["Lon"]},
                    "routeId": bus["RouteID"],
                    "direction": bus["DirectionText"],
                    "destination": bus["TripHeadsign"],
                    "deviation": bus["Deviation"],
                    "lastUpdated": bus["DateTime"],
                }
            )

        return jsonify(bus_positions), 200

    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Error fetching metro data: {str(e)}")
        return jsonify({"error": "Failed to fetch metro data"}), 500


if __name__ == "__main__":
    app.run(debug=False, port=5000)
