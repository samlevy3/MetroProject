from typing import Dict, List

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Sample metro data for testing
SAMPLE_METRO_DATA: List[Dict[str, str]] = [
    {"id": "1", "name": "Red Line", "status": "On Time", "nextArrival": "2 minutes"},
    {"id": "2", "name": "Blue Line", "status": "Delayed", "nextArrival": "10 minutes"},
]


@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy"})


@app.route("/api/metro-status")
def get_metro_status():
    # try:
    #     # Replace with your actual metro API endpoint
    #     METRO_API_URL = os.getenv("METRO_API_URL", "default_url_here")
    #     response = requests.get(METRO_API_URL)
    #     return jsonify(response.json()), 200
    # except Exception as e:
    #     return jsonify({"error": str(e)}), 500
    return jsonify(SAMPLE_METRO_DATA)

