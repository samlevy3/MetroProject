# Metro Status Application

A web application that displays metro status information using React (Next.js) frontend and Flask backend.

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- pip
- npm

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Run development server
gunicorn src.app:APP --bind 0.0.0.0:5001 --reload

# Run tests
pytest

# Run linting
pylint src/ tests/
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## Development URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/metro-status` - Get metro status information

## Environment Variables

### Backend
- `METRO_API_URL` - URL of the external metro API

### Frontend
- `NEXT_PUBLIC_API_URL` - URL of the backend API

## Running with Docker

```bash
# Build and run backend
cd backend
docker build -t metro-api .
docker run -p 5000:8080 metro-api
```

## Testing

### Backend
```bash
cd backend
pytest  # Run tests
tox     # Run tests, linting, and type checking
```

### Frontend
```bash
cd frontend
npm test        # Run tests
npm run lint    # Run linting
npm run type-check  # Run type checking
```

## GitHub Actions

The repository includes CI/CD workflows for both frontend and backend:
- Automated testing
- Linting
- Type checking
- Deployment to GCP (on develop branch)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── __init__.py
│   │   └── app.py
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
└── README.md
```