# GeoSentra - Live Geopolitical Risk Agent

**AI-powered supply chain risk intelligence platform with real-time monitoring and autonomous response.**

[![Version](https://img.shields.io/badge/version-3.0.0-cyan)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com)

---

## ✨ Features (9 Pages)

### Core Intelligence
1. **🗺️ Map Overview** - Interactive supply chain visualization with real-time risk heatmap
2. **📋 Risk Events** - AI-powered crisis detection from news, satellite, and social media
3. **🔗 Suppliers** - Network graph analysis showing supplier dependencies
4. **🛰️ Satellite Monitoring** - NASA EONET natural disaster tracking (earthquakes, floods, wildfires)
5. **💬 Social Listener** - Reddit r/supplychain early warning signals (24-48 hours ahead)

### Advanced Analytics
6. **🚢 Shipping Routes** - Real-time vessel tracking using free AIS data (AISHub.net)
7. **💰 Cost Prediction** - AI disruption forecasting using 73K+ historical scenarios

### Automation
8. **💾 ERP Integration** - Import supplier data from CSV/Excel
9. **📄 RFQ Management** - Auto-generate procurement requests for alternative suppliers

---

## 📊 Data Sources (Real APIs - No Hardcoded Data)

- **NewsAPI.org** - Global crisis detection (requires free API key)
- **NASA EONET** - Natural disasters (free, no key needed)
- **Reddit JSON** - Social media signals (free, no key needed)
- **Google Gemini AI** - Event analysis (requires free API key)
- **AISHub.net** - Real-time vessel tracking (free, no key needed)
- **World Bank LPI** - Country logistics performance (free, no key needed)
- **Predictive Model** - Cost forecasting (73,102 training samples from CSV)

---

## 🚀 Quick Start

### Prerequisites
- **Backend**: Python 3.9+, pip
- **Frontend**: Node.js 18+, npm
- **Required API Key**: Google Gemini API key (free tier)

### Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create .env file with:
GEMINI_API_KEY=your_gemini_api_key_here

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Access Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🔑 Get API Keys

### Required
- **Google Gemini**: https://makersuite.google.com/app/apikey
  - Free tier: 60 requests/minute
  - Used for: AI event analysis and severity scoring

### Optional (for more features)
- **NewsAPI**: https://newsapi.org/register
  - Free tier: 100 requests/day
  - Used for: Crisis detection from global news

---

## 💡 Demo Scenario: Taiwan Earthquake

### Timeline

**Day 1 - 08:00 AM**
```
1. NASA EONET detects 7.2 magnitude earthquake in Taiwan
2. GeoSentra AI analyzes: Severity 8/10, High Impact
3. Alert created: "Earthquake in Taiwan - High Severity"
4. Affected suppliers identified: 3 suppliers in Taiwan region
```

**Day 1 - 02:00 PM**
```
5. Reddit signals: "TSMC factories shut down for inspection"
6. Social Listener flags: High urgency discussion in r/supplychain
7. Dashboard shows: 2 critical suppliers offline
8. Shipping Routes: Vessels rerouting around Taiwan
```

**Day 1 - 06:00 PM**
```
9. User checks ERP: 3 suppliers in Taiwan (semiconductors, electronics)
10. Clicks "Generate RFQ" for affected suppliers
11. Cost Prediction: $127K estimated impact, 4.5 days disruption
12. System finds 5 alternative suppliers (Korea, USA, Singapore)
13. RFQs sent automatically via email
```

**Day 2**
```
14. Procurement team receives 3 responses
15. Selects backup supplier in South Korea
16. Production continues with minimal delay
17. Total cost: $45K (vs. $2M+ if reacted on Day 3)
```

### Impact
- **Without GeoSentra**: React on Day 3, 2-week production halt, $2M+ loss
- **With GeoSentra**: Proactive on Day 1, 2-day delay, $45K cost

**ROI: $1.95M saved on single event**

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: Google Gemini, NetworkX, Pandas
- **APIs**: NewsAPI, NASA EONET, Reddit JSON, AISHub (AIS data)
- **Data Processing**: 73K+ cost prediction dataset

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query

---

## 📁 Project Structure

```
GeoSentra/
├── Backend/
│   ├── app/
│   │   ├── shipping/        # Real AIS vessel tracking
│   │   ├── prediction/      # Cost prediction (73K dataset)
│   │   ├── risk/            # Risk events
│   │   ├── suppliers/       # Supplier network
│   │   ├── satellite/       # NASA EONET
│   │   ├── social/          # Reddit listener
│   │   ├── erp/             # ERP integration
│   │   ├── rfq/             # Auto-RFQ
│   │   └── main.py          # FastAPI app
│   ├── Model/
│   │   └── Predective_Forecast_After_Engineering.csv  # 73K rows
│   └── requirements.txt
├── Frontend/
│   ├── src/
│   │   ├── pages/           # 9 pages
│   │   ├── components/      # Reusable UI
│   │   └── App.tsx
│   └── package.json
└── README.md
```

---

## 🎨 UI Theme

**Consistent Dark Theme:**
- Background: Slate-950 (#0f172a)
- Cards: Slate-900/50 with backdrop blur
- Primary Accent: Cyan-400 (#22d3ee)
- Secondary Accent: Emerald-400 (#34d399)
- Borders: Slate-800 (#1e293b)
- Text: Slate-100 (#f1f5f9)

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

---

## 🌟 Acknowledgments

- **NASA EONET** - Natural disaster data
- **NewsAPI.org** - Global news coverage
- **Reddit** - Community insights
- **Google Gemini** - AI analysis
- **AISHub.net** - Free AIS vessel data
- **shadcn/ui** - Beautiful UI components

---

**Built with ❤️ for supply chain resilience**

**Version 3.0.0** | **Last Updated**: January 2026 | **Status**: Production Ready ✅

---

## 📈 Real Data Sources Summary

| Feature | Data Source | API Key Required | Cost |
|---------|-------------|------------------|------|
| Risk Events | NewsAPI + Gemini AI | Yes (both free) | Free |
| Satellite | NASA EONET | No | Free |
| Social Listener | Reddit JSON | No | Free |
| Shipping Routes | AISHub.net AIS | No | Free |
| Cost Prediction | Local CSV (73K rows) | No | Free |
| ERP Integration | User uploads | No | Free |
| RFQ Generation | In-memory + Gemini | Yes (Gemini) | Free |

**Total Cost: $0/month** (using free tiers)
