import os
from dataclasses import dataclass
from io import BytesIO

import requests
from dotenv import load_dotenv
from flask import Flask, abort, current_app, jsonify, request, send_file
from flask_cors import CORS
from google.cloud import storage
from google.cloud.exceptions import Forbidden, GoogleCloudError, NotFound

app = Flask(__name__, static_folder=None)
CORS(app)

load_dotenv()

# Load environment variables
app.config["METRO_API_URL"] = os.getenv("METRO_API_URL")
app.config["METRO_KEY"] = os.getenv("METRO_KEY")
app.config["GCP_BUCKET_NAME"] = os.getenv("GCP_BUCKET_NAME")
app.config["CLOUDFLARE_SHARED_SECRET"] = os.getenv("CLOUDFLARE_SHARED_SECRET")
app.config["TURNSTILE_SECRET_KEY"] = os.getenv("TURNSTILE_SECRET_KEY")
app.config["TURNSTILE_ENABLED"] = (
    os.getenv("TURNSTILE_ENABLED", "true").lower() == "true"
)


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


def verify_turnstile_token(token):
    """Verify the Turnstile token with Cloudflare."""
    try:
        response = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": current_app.config["TURNSTILE_SECRET_KEY"],
                "response": token,
            },
            timeout=10,
        )
        result = response.json()
        return result.get("success", False)
    except requests.RequestException:
        current_app.logger.error("Failed to verify Turnstile token")
        return False


@app.before_request
def validate_tokens():
    # Skip validation for non-API routes and health check
    if not request.path.startswith("/api") or request.path == "/api/health":
        return

    # Validate Cloudflare token
    incoming_token = request.headers.get("X-Custom-Token")
    expected_token = current_app.config.get("CLOUDFLARE_SHARED_SECRET")

    if not expected_token:
        current_app.logger.error("token not set in env")
        abort(500)  # Misconfigured server

    if not incoming_token:
        current_app.logger.warning("Missing X-Custom-Token in request")
        abort(403)

    if incoming_token != expected_token:
        current_app.logger.warning("Invalid X-Custom-Token provided")
        abort(403)

    # Only validate Turnstile if enabled
    if current_app.config.get("TURNSTILE_ENABLED"):
        turnstile_token = request.headers.get("CF-Turnstile-Token")
        if not turnstile_token:
            current_app.logger.warning("Missing Turnstile token")
            abort(403)

        if not verify_turnstile_token(turnstile_token):
            current_app.logger.warning("Invalid Turnstile token")
            abort(403)


@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy"})


@app.route("/api/metro-status")
def get_metro_status():
    route_id = request.args.get("routeid")
    metro_key = current_app.config.get("METRO_KEY")
    metro_api_url = current_app.config.get("METRO_API_URL")
    try:
        if not metro_key:
            current_app.logger.error("METRO_KEY environment variable not set")
            return jsonify({"error": "API key not configured"}), 500

        headers = {"api_key": metro_key, "Content-Type": "application/json"}

        url = f"{metro_api_url}"
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


@app.route("/static/<path:filename>")
def serve_static(filename):
    try:
        # Initialize GCS client and get the bucket
        storage_client = storage.Client()
        bucket = storage_client.bucket(current_app.config.get("GCP_BUCKET_NAME"))

        # Get the blob from GCS
        blob = bucket.blob(filename)

        # Check if the blob exists in GCS
        blob.reload()  # This ensures the blob metadata is refreshed
        if not blob.exists():
            return jsonify({"error": "File not found in GCS"}), 404

        # Download the file as bytes
        file_content = blob.download_as_bytes()

        # Set appropriate content type (you can customize this)
        content_type = blob.content_type or "application/octet-stream"

        # Serve the file using send_file
        return send_file(BytesIO(file_content), mimetype=content_type)

    except NotFound:
        # If the file doesn't exist in GCS
        error_blob = bucket.blob("404.html")
        error_blob.reload()
        file_content = error_blob.download_as_bytes()
        content_type = error_blob.content_type or "text/html"
        return send_file(BytesIO(file_content), mimetype=content_type), 404

    except Forbidden:
        # If the service account doesn't have permission to access the file
        app.logger.error("Forbidden access to file: %s", filename)
        return jsonify({"error": "Access denied to the requested file"}), 403

    except GoogleCloudError as e:
        # General Google Cloud Storage errors
        app.logger.error("Google Cloud Storage error: %s", str(e))
        return (
            jsonify({"error": "An error occurred while fetching the file from GCS"}),
            500,
        )


if __name__ == "__main__":
    app.run(debug=False, port=5000)
