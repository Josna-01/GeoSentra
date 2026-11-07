# GeoSentra Backend

## 🔧 Overview

The GeoSentra backend is a high-performance Python API server built with FastAPI. It serves as the intelligence engine of the platform, processing real-time data from multiple sources, analyzing events with AI, and providing risk assessments for supply chain disruptions.

## 🧠 What This Does

The backend is the **brain** of GeoSentra. Here's what happens behind the scenes:

1. **Continuous Data Collection**: Every few minutes, the system:
   - Fetches news articles from NewsAPI.org
   - Pulls satellite data from NASA EONET
   - Monitors Reddit for supply chain discussions
   - Tracks flights via OpenSky Network
   - Checks port weather conditions

2. **AI Analysis**: When new information arrives:
   - Google Gemini AI reads and understands the content
   - Extracts key details: location, severity, affected industries
   - Determines which suppliers might be impacted

3. **Risk Calculation**: The system:
   - Maps events to geographic locations
   - Identifies suppliers in affected regions
   - Calculates risk scores (1-10 scale)
   - Finds alternative supply routes using graph algorithms

4. **Data Serving**: Provides clean, structured data to the frontend:
   - Real-time alerts and notifications
   - Supplier network graphs
   - Event timelines and severity scores
   - Alternative routing recommendations

## 🛠️ Tech Stack

### Core Framework
- **FastAPI 0.115.6** - Modern, fast web framework for Python
- **Uvicorn 0.34.0** - Lightning-fast ASGI server
- **Pydantic 2.10.5** - Data validation using Python type hints

### AI & Machine Learning
- **Google Generative AI (Gemini)** - Event analysis and extraction
  - Model: `gemini-1.5-pro`
  - Used for: Natural language understanding, event detection
- **NetworkX 3.4.2** - Graph analysis for supply chain networks
- **Pandas 2.2.3** - Data manipulation and analysis

### Database & Storage
- **Firebase Admin SDK 6.6.0** - Cloud Firestore database
- **Google Cloud Firestore 2.20.1** - NoSQL document database

### HTTP & External APIs
- **Requests 2.32.3** - HTTP library for API calls
- **HTTPX 0.28.1** - Async HTTP client

### Data Processing
- **OpenPyXL 3.1.5** - Excel file reading (World Bank LPI data)
- **Python-dotenv 1.0.1** - Environment variable management

### Security & Authentication
- **Python-Jose 3.3.0** - JWT token handling
- **Passlib 1.7.4** - Password hashing
- **Bcrypt 4.2.1** - Secure password hashing

## 📂 Project Structure

```
Backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and settings
│   ├── db.py                # Firebase database connection
│   │
│   ├── risk/                # Risk analysis module
│   │   ├── router.py        # Risk API endpoints
│   │   └── service.py       # Business logic
│   │
│   ├── ml/                  # Machine Learning & AI
│   │   ├── event_detection.py    # Gemini AI event analysis
│   │   └── graph_analysis.py     # Supply chain graph algorithms
│   │
│   ├── satellite/           # Satellite monitoring
│   │   └── router.py        # NASA EONET integration
│   │
│   ├── social/              # Social media monitoring
│   │   └── router.py        # Reddit API integration
│   │
│   ├── flights/             # Flight tracking
│   │   └── router.py        # OpenSky Network integration
│   │
│   ├── market/              # Market data
│   │   └── router.py        # Currency & commodity tracking
│   │
│   ├── suppliers/           # Supplier management
│   │   └── router.py        # Supplier CRUD operations
│   │
│   ├── auth/                # Authentication (legacy)
│   │   ├── router.py
│   │   ├── service.py
│   │   └── google.py
│   │
│   └── utils/               # Utilities
│       ├── jwt.py           # JWT token handling
│       ├── email.py         # Email notifications
│       └── news_service.py  # NewsAPI integration
│
├── Dataset/
│   └── World_Bank_LPI.xlsx  # Logistics Performance Index data
│
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (not in git)
└── README.md               # This file
```

## 🔌 API Endpoints

### Risk Management (`/risk`)

#### `GET /risk/graph`
Returns the complete supplier network as a graph structure.

**Response:**
```json
{
  "nodes": [
    {
      "id": "Germany",
      "name": "Germany",
      "lpi_score": 4.2,
      "location": [51.1657, 10.4515],
      "status": "safe"
    }
  ],
  "edges": [
    {
      "source": "Germany",
      "target": "Netherlands",
      "weight": 0.8
    }
  ]
}
```

#### `GET /risk/alerts`
Fetches active crisis alerts from the database.

**Response:**
```json
[
  {
    "id": "alert_123",
    "event_type": "Earthquake",
    "location": {"city": "Tokyo", "country": "Japan"},
    "severity_score": 8,
    "affected_suppliers": ["Japan", "Korea, Rep."],
    "timestamp": "2024-01-12T10:30:00Z"
  }
]
```

#### `POST /risk/simulate?event_text=...`
Simulates a crisis event using AI analysis.

**Parameters:**
- `event_text` (string): Description of the event

**Example:**
```
POST /risk/simulate?event_text=Major earthquake in Tokyo disrupts electronics manufacturing
```

**Response:**
```json
{
  "id": "event_456",
  "event_type": "Earthquake",
  "severity_score": 8,
  "affected_suppliers": ["Japan", "Korea, Rep."],
  "alternative_routes": [...]
}
```

#### `GET /risk/alternative-paths?source=...&target=...&avoid=...`
Finds alternative supply routes avoiding disrupted nodes.

**Parameters:**
- `source`: Starting supplier
- `target`: Destination supplier
- `avoid`: Comma-separated list of nodes to avoid

### Satellite Monitoring (`/satellite`)

#### `GET /satellite/events?limit=30`
Fetches natural disaster events from NASA EONET, filtered for logistics impact.

**Filtered Categories:**
- Wildfires
- Severe Storms
- Floods
- Volcanoes
- Earthquakes
- Landslides
- Drought
- Snow
- Sea and Lake Ice

**Response:**
```json
{
  "total": 15,
  "events": [
    {
      "id": "EONET_123",
      "title": "Wildfire - California",
      "category": "Wildfires",
      "location": {"coordinates": [34.05, -118.24]},
      "date": "2024-01-12T08:00:00Z",
      "source": "NASA EONET"
    }
  ]
}
```

#### `GET /satellite/port-activity?port=shanghai`
Gets real-time marine weather conditions for a port.

**Data Sources:**
- Nominatim (OpenStreetMap) - Geocoding
- Open-Meteo Marine API - Weather data

**Response:**
```json
{
  "name": "Port of Shanghai",
  "location": "Shanghai, China",
  "coordinates": [31.23, 121.47],
  "weather": {
    "wave_height_m": 1.2,
    "wind_wave_height_m": 0.8,
    "swell_wave_height_m": 0.4,
    "ocean_current_speed": 0.5
  },
  "status": "Optimal"
}
```

### Social Media (`/social`)

#### `GET /social/trends?limit=20`
Monitors Reddit for supply chain disruption signals.

**Data Source:** Reddit JSON API (r/supplychain)

**Response:**
```json
{
  "total": 20,
  "trends": [
    {
      "id": "abc123",
      "keyword": "Container Shortage Worsens in Asia",
      "region": "Global",
      "mentions": 342,
      "sentiment": "negative",
      "trending_score": 0.85,
      "sample_text": "Reports indicate severe container shortages...",
      "source": "Reddit (r/supplychain)"
    }
  ]
}
```

### Flight Tracking (`/flights`)

#### `GET /flights/executive-travel?limit=10`
Tracks flights using OpenSky Network API.

**Data Source:** OpenSky Network (Live ADS-B data)

**Response:**
```json
{
  "total": 10,
  "flights": [
    {
      "id": "BAW123",
      "airline": "British Airways",
      "origin": "United Kingdom",
      "destination": "London Area",
      "status": "In Flight",
      "aircraft_type": "Unknown (OpenSky)",
      "significance": "High"
    }
  ]
}
```

### Market Data (`/market`)

#### `GET /market/currencies`
Real-time currency exchange rates.

**Data Source:** ExchangeRate-API.com

**Response:**
```json
{
  "base": "USD",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    "JPY": 110.5,
    "CNY": 6.45
  },
  "timestamp": "2024-01-12T10:00:00Z"
}
```

## 🤖 AI Event Detection

### How It Works

1. **Input**: News article or event description
2. **Processing**: Sent to Google Gemini AI with structured prompt
3. **Output**: Structured JSON with:
   - Event type (Earthquake, Strike, Flood, etc.)
   - Location (city, country, coordinates)
   - Severity score (1-10)
   - Affected sectors (Manufacturing, Logistics, etc.)
   - Summary

### Example Prompt
```
Analyze this supply chain event and extract structured information:

Event: "Major port strike in Rotterdam causes shipping delays across Europe"

Return JSON with: event_type, location, severity_score, affected_sectors, summary
```

### Gemini Response
```json
{
  "event_type": "Strike",
  "location": {
    "city": "Rotterdam",
    "country": "Netherlands",
    "coordinates": [51.92, 4.47]
  },
  "severity_score": 7,
  "affected_sectors": ["Logistics", "Shipping", "Manufacturing"],
  "summary": "Port workers strike disrupting European supply chains"
}
```

## 📊 Data Sources & APIs Used

| API | Purpose | Endpoint | Cost | Rate Limit |
|-----|---------|----------|------|------------|
| **NASA EONET** | Natural disasters | `https://eonet.gsfc.nasa.gov/api/v3/events` | Free | None |
| **Reddit JSON** | Social trends | `https://www.reddit.com/r/supplychain/hot.json` | Free | ~60 req/min |
| **OpenSky Network** | Flight tracking | `https://opensky-network.org/api/states/all` | Free | 400 req/day |
| **Open-Meteo Marine** | Port weather | `https://marine-api.open-meteo.com/v1/marine` | Free | Unlimited |
| **Nominatim OSM** | Geocoding | `https://nominatim.openstreetmap.org/search` | Free | 1 req/sec |
| **ExchangeRate-API** | Currency rates | `https://api.exchangerate-api.com/v4/latest/USD` | Free | Unlimited |
| **NewsAPI.org** | Global news | `https://newsapi.org/v2/everything` | Free tier | 100 req/day |
| **Google Gemini** | AI analysis | Google AI Studio API | Free tier | 60 req/min |

## 🚀 Getting Started

### Prerequisites
- Python 3.9 or higher
- pip package manager
- Firebase project (for database)
- API Keys:
  - Google Gemini API key
  - NewsAPI.org key

### Installation

1. **Create virtual environment**
```bash
python -m venv .venv
```

2. **Activate virtual environment**
```bash
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup environment variables**

Create `.env` file:
```env
# Required
GOOGLE_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_newsapi_key_here

# Optional
SECRET_KEY=your_jwt_secret_key
FIREBASE_CREDENTIALS_PATH=path/to/firebase-credentials.json
```

5. **Add Firebase credentials**
- Download your Firebase Admin SDK JSON file
- Place it in the Backend directory
- Update path in `.env` or `config.py`

6. **Run the server**
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Environment Variables

```env
# AI & External APIs
GOOGLE_API_KEY=your_gemini_api_key          # Required for AI analysis
NEWS_API_KEY=your_newsapi_key               # Required for news ingestion

# Security
SECRET_KEY=your_secret_key_for_jwt          # For JWT token signing

# Database
FIREBASE_CREDENTIALS_PATH=./firebase.json   # Path to Firebase credentials

# Optional
DATASET_DIR=./Dataset                       # Path to World Bank LPI data
```

## 📈 Performance & Optimization

### Caching
- News deduplication using MD5 hashing
- Prevents processing the same article twice

### Async Operations
- FastAPI's async/await for concurrent requests
- Non-blocking I/O for external API calls

### Database Optimization
- Firestore indexes for fast queries
- Limited result sets (e.g., latest 20 alerts)

## 🐛 Troubleshooting

### Firebase Connection Issues
```python
# Check if Firebase is initialized
from app.db import db
print(db)  # Should show Firestore client
```

### Gemini API Errors
- Verify API key is correct
- Check quota limits in Google AI Studio
- Ensure model name is `gemini-1.5-pro`

### News API Rate Limits
- Free tier: 100 requests/day
- Implement caching to reduce calls
- Consider upgrading for production

## 🧪 Testing

```bash
# Run with test mode
pytest

# Test specific endpoint
curl http://localhost:8000/risk/graph

# Test AI analysis
curl -X POST "http://localhost:8000/risk/simulate?event_text=Earthquake in Tokyo"
```

## 📦 Deployment

### Production Checklist
- [ ] Set `DEBUG=False` in config
- [ ] Use production database
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Use environment variables for secrets
- [ ] Set up automated backups

### Deployment Options
- **Docker**: Create Dockerfile for containerization
- **Cloud Run**: Deploy to Google Cloud Run
- **AWS Lambda**: Serverless deployment
- **Heroku**: Simple PaaS deployment
- **Railway**: Modern deployment platform

## 🔄 Background Tasks

The system runs automated tasks:

1. **News Ingestion** (Every 6 hours)
   - Fetches latest news from NewsAPI
   - Processes through AI
   - Creates alerts for disruptions

2. **Data Refresh** (Every 5 minutes)
   - Updates satellite events
   - Refreshes social media trends
   - Updates flight data

## 🤝 Contributing

When adding new features:
1. Create new router in appropriate module
2. Add endpoint to `main.py`
3. Update this README with API documentation
4. Add type hints for all functions
5. Handle errors gracefully
6. Add logging for debugging

## 📄 License

Part of the GeoSentra project - see root README for details.

---

**Powered by FastAPI, Google Gemini AI, and Open Data** 🚀
