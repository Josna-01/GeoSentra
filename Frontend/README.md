# GeoSentra Frontend

## 📱 Overview

The GeoSentra frontend is a modern, responsive web application built with React and TypeScript. It provides an intuitive interface for monitoring global supply chain risks through interactive maps, real-time dashboards, and intelligent visualizations.

## 🎨 What This Does

Think of this as your **mission control center** for supply chain management. The frontend displays:

1. **Interactive Risk Map**: A world map showing all your suppliers with color-coded risk levels
2. **Live Event Feed**: Real-time updates on disruptions affecting your supply chain
3. **Satellite Monitoring**: Natural disasters and weather events from space
4. **Social Media Pulse**: What people are saying about supply chain issues on Reddit
5. **Flight Tracker**: Executive travel and cargo flight patterns
6. **Supplier Network**: Visual graph of your supply chain connections

## 🛠️ Tech Stack

### Core Framework
- **React 18.3.1** - Modern UI library with hooks
- **TypeScript 5.6.2** - Type-safe JavaScript
- **Vite 6.0.5** - Lightning-fast build tool and dev server

### UI & Styling
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **Framer Motion 11.15.0** - Smooth animations and transitions
- **Radix UI** - Accessible component primitives
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-dropdown-menu` - Dropdown menus
  - `@radix-ui/react-label` - Form labels
  - `@radix-ui/react-slot` - Component composition
  - `@radix-ui/react-toast` - Toast notifications
  - `@radix-ui/react-tooltip` - Tooltips

### Data Visualization
- **Recharts 2.15.0** - Charts and graphs
- **React Leaflet 4.2.1** - Interactive maps
- **Leaflet 1.9.4** - Mapping library

### State Management & Data Fetching
- **Tanstack React Query 5.62.12** - Server state management
- **React Router DOM 7.1.1** - Client-side routing
- **Context API** - Global state (risk data, suppliers, events)

### Icons & Assets
- **Lucide React 0.469.0** - Beautiful icon library

### Utilities
- **clsx 2.1.1** - Conditional className utility
- **tailwind-merge 2.6.0** - Merge Tailwind classes intelligently
- **date-fns** - Date formatting and manipulation

## 📂 Project Structure

```
Frontend/
├── src/
│   ├── pages/              # Main application pages
│   │   ├── Dashboard.tsx   # Main map view with risk overlay
│   │   ├── Events.tsx      # Crisis event list and details
│   │   ├── Suppliers.tsx   # Supplier network management
│   │   ├── SatelliteMonitoring.tsx  # NASA satellite events
│   │   ├── SocialListener.tsx       # Reddit social trends
│   │   └── FlightTracking.tsx       # Flight monitoring
│   │
│   ├── components/         # Reusable UI components
│   │   ├── RiskMap.tsx     # Interactive Leaflet map
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── EventCard.tsx   # Event display card
│   │   ├── SupplierCard.tsx # Supplier information
│   │   ├── MarketWidget.tsx # Currency market data
│   │   ├── GraphStreamWidget.tsx # Real-time graph
│   │   └── ui/             # Shadcn UI components
│   │
│   ├── context/            # React Context providers
│   │   └── RiskProvider.tsx # Global risk state management
│   │
│   ├── lib/                # Utility functions
│   │   └── utils.ts        # Helper functions
│   │
│   ├── layouts/            # Page layouts
│   │   └── AppLayout.tsx   # Main app layout with sidebar
│   │
│   ├── App.tsx             # Root component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🔌 API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000` and consumes these endpoints:

### Risk & Events
- `GET /risk/graph` - Supplier network graph data
- `GET /risk/alerts` - Active crisis alerts
- `POST /risk/simulate` - Trigger crisis simulation
- `GET /risk/alternative-paths` - Find alternative supply routes

### Satellite Monitoring
- `GET /satellite/events` - NASA EONET natural disaster events
- `GET /satellite/port-activity` - Port weather and marine conditions

### Social Media
- `GET /social/trends` - Reddit supply chain trends and sentiment

### Flight Tracking
- `GET /flights/executive-travel` - Live flight data from OpenSky Network
- `GET /flights/cargo-flights` - Cargo hub activity
- `GET /flights/delays` - Flight delay statistics

### Market Data
- `GET /market/currencies` - Real-time currency exchange rates
- `GET /market/commodities` - Commodity price tracking

### News
- `POST /risk/ingest-news` - Fetch and process latest news

## 🎯 Key Features

### 1. Interactive Risk Map
- **Technology**: React Leaflet + OpenStreetMap
- **Features**:
  - Zoom and pan across the world
  - Click suppliers to see details
  - Color-coded risk indicators (green/yellow/red)
  - Event markers showing active crises
  - Polylines showing supply chain connections

### 2. Real-Time Updates
- **Technology**: Tanstack Query with auto-refetch
- **Features**:
  - Automatic data refresh every 60 seconds
  - Loading states and error handling
  - Optimistic UI updates

### 3. Responsive Design
- **Technology**: TailwindCSS responsive utilities
- **Features**:
  - Mobile-friendly layouts
  - Adaptive navigation (sidebar collapses on mobile)
  - Touch-optimized interactions

### 4. Smooth Animations
- **Technology**: Framer Motion
- **Features**:
  - Page transitions
  - Card hover effects
  - Staggered list animations
  - Loading skeletons

### 5. Search & Autocomplete
- **Pages**: Flight Tracking, Satellite Monitoring
- **Features**:
  - Real-time filtering as you type
  - Suggestion dropdowns
  - Keyboard navigation support

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:8080`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎨 Styling System

### Color Palette
- **Background**: Slate-950 (dark theme)
- **Cards**: Slate-900 with transparency
- **Borders**: Slate-800
- **Text**: Slate-100 (primary), Slate-400 (secondary)
- **Accents**:
  - Purple-400 (Satellite)
  - Blue-400 (Social)
  - Emerald-400 (Flights)
  - Red-400 (Critical alerts)
  - Amber-400 (Warnings)

### Typography
- **Headings**: Bold, tracking-tight
- **Body**: Regular weight, slate-300
- **Labels**: Uppercase, tracking-wider, text-xs

## 🔄 State Management

### Global State (RiskProvider)
```typescript
interface RiskContextType {
  suppliers: Supplier[];      // All suppliers in network
  events: RiskEvent[];        // Active crisis events
  isLoading: boolean;         // Loading state
  simulateCrisis: (text: string) => Promise<void>;
  refreshData: () => Promise<void>;
}
```

### Local State
- Component-level state with `useState`
- Form state management
- UI interaction states (modals, dropdowns)

## 📱 Pages Overview

### Dashboard (`/app`)
Main landing page with interactive world map showing suppliers and active crisis events.

### Risk Events (`/app/events`)
List view of all active disruptions with severity scores and affected suppliers.

### Suppliers (`/app/suppliers`)
Detailed view of supplier network with search and filtering capabilities.

### Satellite Monitoring (`/app/satellite`)
NASA EONET events filtered for logistics impact + port weather search.

### Social Listener (`/app/social`)
Reddit trends related to supply chain disruptions with sentiment analysis.

### Flight Tracking (`/app/flights`)
Live flight data with origin/destination search and autocomplete.

## 🔐 Environment Variables

Create a `.env.local` file (optional for frontend):
```env
VITE_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Map not loading
- Check if backend is running on port 8000
- Verify CORS is enabled in backend
- Check browser console for errors

### Data not updating
- Ensure backend API is accessible
- Check network tab for failed requests
- Verify API endpoints are correct

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check TypeScript errors: `npm run build`

## 📦 Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` folder, ready for deployment to any static hosting service (Vercel, Netlify, AWS S3, etc.).

## 🎯 Performance Optimizations

- Code splitting with React.lazy (planned)
- Image optimization
- Memoization of expensive computations
- Debounced search inputs
- Virtual scrolling for long lists (planned)

## 🤝 Contributing

When adding new features:
1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update routing in `App.tsx`
4. Add navigation links in `Sidebar.tsx`
5. Follow existing naming conventions
6. Use TypeScript for type safety

## 📄 License

Part of the GeoSentra project - see root README for details.

---

**Built with React, TypeScript, and modern web technologies** 🚀
