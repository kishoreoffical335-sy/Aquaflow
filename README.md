# AquaFlow ? IoT Water Quality & Flow Monitoring System

AquaFlow is a production-ready, environmental IoT telemetry web platform designed to ingest, validate, analyze, and visualize real-time water measurements from physical ESP32 microcontrollers. It features an **iOS 26-inspired Liquid Glass interface** floating above a dynamic, multi-layered water atmosphere with strict **zero-demo-data integrity**.

---

## Key System Architecture & Principles

1. **Strict Data Integrity (Zero Fabricated Readings)**:
   - All charts, cards, statistics, and history tables display clean, high-fidelity Liquid Glass empty states until authentic physical ESP32 telemetry packets arrive.
2. **Physical Sensor Matrix**:
   - **pH Probe**: `0.00 ? 14.00 pH` (`MEASURED`)
   - **Optical Turbidity Sensor**: `0 ? 4000 NTU` (`MEASURED`)
   - **Hall-Effect Flow Meter**: `L/min` velocity (`MEASURED`)
   - **Total Accumulated Volume**: `Liters` derived from flow pulse integration (`DERIVED`)
   - **Dissolved Oxygen (DO)**: Calculated exclusively when calibrated calculation models and input parameters are available (`CALCULATED`). Displays *"Dissolved oxygen calculation unavailable with current sensor inputs"* when physical prerequisites are unmet.
   - *No TDS or Temperature sensors are rendered.*
3. **Liquid Glass UI & Scroll-Driven Storytelling**:
   - Multi-layer specular highlights, frosted glass blur, floating capsule header with scroll-linked transforms, and fluid water background.
4. **Resilient Ingestion API & Alert Engine**:
   - `POST /api/v1/telemetry` with Device UID + SHA-256 API token verification, Zod schema range validation, deduplication, cooldowns, and automatic recovery detection.
5. **Real-Time Data Pipeline**:
   - PostgreSQL database with Row Level Security (RLS) and Supabase Realtime WebSocket subscriptions for zero-refresh dashboard updates.
6. **Excel (.xlsx) Export**:
   - Direct export of stored telemetry records with frozen headers, formatted styling, and date presets (10-day, 30-day, custom range).

---

## Application Structure

```
??? app/
?   ??? api/v1/
?   ?   ??? alerts/       # Deduplicated incident querying and patch actions
?   ?   ??? devices/      # Device provisioning & SHA-256 token issuance
?   ?   ??? export/       # Microsoft Excel (.xlsx) streaming endpoint
?   ?   ??? telemetry/    # Secure ESP32 telemetry ingestion endpoint
?   ?   ??? thresholds/   # Configurable water quality thresholds CRUD
?   ??? auth/callback/    # Supabase OAuth session callback
?   ??? dashboard/
?   ?   ??? alerts/       # Real-time incident hub & resolution
?   ?   ??? analytics/    # Statistical distributions from real database records
?   ?   ??? devices/      # Device registry & API token manager
?   ?   ??? hardware/     # ESP32 integration guide & ready-to-flash C++ sketch
?   ?   ??? history/      # Digital Passbook chronological telemetry ledger
?   ?   ??? live/         # Supabase Realtime WebSocket live feed
?   ?   ??? reports/      # Excel export center
?   ?   ??? sensors/      # Sensor matrix & hardware pin specifications
?   ?   ??? settings/     # Threshold limits & offline timeout configuration
?   ?   ??? layout.tsx    # Liquid Glass dashboard layout & navigation
?   ?   ??? page.tsx      # Overview console answering 6 core system questions
?   ??? login/            # Dedicated Liquid Glass Google Authentication
?   ??? globals.css       # Liquid Glass design tokens & water atmosphere classes
?   ??? layout.tsx        # Root HTML layout
?   ??? page.tsx          # Scroll-driven landing page
??? components/
?   ??? charts/           # Empty-state aware SVG area charts
?   ??? dashboard/        # SensorCard, RealtimeStatusBadge
?   ??? landing/          # LandingPageStory, ArchitectureDiagram
?   ??? layout/           # Floating Navbar, DashboardSidebar, NotificationCenter
?   ??? ui/               # Badge, Button, Card, EmptyState, WaterBackground
??? lib/
?   ??? export/           # ExcelJS workbook generator
?   ??? supabase/         # SSR & Admin Supabase clients + middleware
?   ??? telemetry/        # Alert engine, Auth hashing, DO calculation, Zod validation
?   ??? types/            # Database & IoT TypeScript schemas
?   ??? utils/            # Styling & date formatting helpers
??? supabase/
    ??? schema.sql        # Complete PostgreSQL schema with RLS & Realtime
```

---

## Getting Started

### 1. Prerequisites
- Node.js `>= 18`
- npm or pnpm or yarn
- Supabase project (for authentication, PostgreSQL, and Realtime)

### 2. Installation & Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

Configure your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Schema Setup
Execute the SQL script in `supabase/schema.sql` within your Supabase SQL Editor. This initializes all tables, RLS policies, indexes, and Realtime publication channels.

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## ESP32 Telemetry API Specification

### Endpoint
```http
POST /api/v1/telemetry
Content-Type: application/json
x-device-key: wq_your_device_api_key
```

### Payload Structure
```json
{
  "device_uid": "ESP32-NODE-01",
  "timestamp": "2026-09-20T12:30:00Z",
  "ph": 7.24,
  "turbidity": 2.15,
  "flow_rate": 4.80,
  "total_flow": 125.60
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Telemetry received",
  "reading_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "do_status": "Unavailable",
  "alerts_evaluated": 0
}
```

---

## License
MIT License
