from flask import Flask, jsonify
from flask_cors import CORS
import requests
from typing import Dict, Any, Tuple, Union
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/health')
def health_check() -> Dict[str, str]:
    return jsonify({"status": "healthy"})

@app.route('/api/metro-status')
def get_metro_status() -> Tuple[Union[Dict[str, Any], str], int]:
    try:
        # Replace with your actual metro API endpoint
        METRO_API_URL = os.getenv('METRO_API_URL', 'default_url_here')
        response = requests.get(METRO_API_URL)
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 