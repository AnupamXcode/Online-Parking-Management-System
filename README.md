# ParkEase — Smart Parking Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20+-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-orange.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-F97316.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20ACID-blue.svg)](https://sqlite.org/)
[![QA Tests](https://img.shields.io/badge/Automated%20QA-17%20Passed-27864B.svg)](tests/system.test.js)

**ParkEase** is a college engineering prototype of a commercial smart parking management platform. It demonstrates an end-to-end parking workflow: user registration, deterministic interval-based slot allocation, digital boarding-pass style tickets with cryptographic QR codes, automated boom barrier entry simulation, transparent exit duration fee calculation, simulated multi-channel payments (UPI, Card, Wallet), and real-time IoT ultrasonic sensor telemetry.

---

## 🎨 Mandatory Color Design System

ParkEase strictly implements the approved warm orange, warm off-white, and warm charcoal visual palette without blue, navy, cyan, violet, or purple:

| Color Token | Hex Code | Role |
| :--- | :--- | :--- |
| **Primary Orange** | `#F97316` | Primary action buttons, active tabs, highlights |
| **Deep Burnt Orange** | `#C2410C` | Button hover gradients, price accents |
| **Warm Orange** | `#EA580C` | Sub-headings, key identifiers, bay numbers |
| **Charcoal** | `#292522` | Dark background accents, high-contrast badges |
| **Warm Charcoal** | `#3A332E` | Body text, readable typography |
| **Warm Off-White** | `#FFFDF9` | Card surfaces, modals, ticket background |
| **Cream Background** | `#FFF7ED` | Section backdrops, subtle card highlights |
| **Light Warm Grey** | `#F4F0EB` | Input backgrounds, table headers |
| **Border Tone** | `#E8DDD2` | Dividers, card boundaries |
| **Success Green** | `#27864B` | Available bays, granted access, paid status |
| **Error Red** | `#C83B32` | Occupied bays, cancellation, barrier stop |

---

## ⚙️ Core Architecture & Features

### 1. Deterministic Conflict-Free Slot Allocation
- **Interval Overlap Prevention:** Verifies that no two drivers can hold overlapping reservations on the same bay for the requested start and end timestamps.
- **Physical Occupancy Safeguard:** If a slot has a vehicle actively checked in whose actual departure has not occurred, the bay is blocked from immediate new arrivals.
- **ACID Transaction:** All bookings run inside an isolated SQLite transaction to guarantee consistency under concurrent requests.
- **Automatic or Preferred:** Drivers can choose automatic allocation (assigns the lowest accessible bay number by floor and zone) or manually pick an available slot from the interactive visual map.

### 2. Digital Parking Pass & Cryptographic QR Token
- Premium boarding-pass card design displaying booking reference, customer name, masked phone number, vehicle plate, category, facility name, floor, slot, entry/exit times, and rate.
- Interactive QR Code (`qrcode.react`) encoding genuine booking parameters for automated gate optical scanners.
- Dedicated print layout (`@media print`) and PDF download capability.

### 3. Automated Boom Barrier Gate Simulation
- **Vehicle Entry Terminal:** Verifies booking ID or vehicle plate against eligibility criteria, marks the session as `checked_in`, turns the slot `occupied`, records the arrival timestamp, and animates the entry boom barrier (swings from 0° to 85° with green signal).
- **Vehicle Exit Terminal:** Finds active checked-in sessions, calculates exact elapsed duration down to the minute, rounds up to the next billable hour according to the transparent pricing formula, adds 18% GST tax, simulates settlement via UPI / Card / Wallet, opens the exit boom barrier, and generates an official itemized tax invoice receipt.

### 4. Simulated IoT Ultrasonic Sensor Mesh
- Every parking bay is mapped to a simulated ultrasonic ground node.
- Real-time telemetry shows distance in centimeters (empty bay: ~285 cm, vehicle parked: <50 cm), battery level, heartbeat timestamp, and online state.
- Evaluators can trigger virtual cars parking or departing from the **Admin IoT Sensors** console to watch slot states update live.

---

## 👥 Documented Demo Accounts

Use these pre-seeded demo accounts for quick evaluation:

| Role | Email | Password | Pre-seeded Features |
| :--- | :--- | :--- | :--- |
| **Demo Driver** | `anupam@example.com` | `UserPass123!` | 2 Registered vehicles, 1 Active Checked-in booking, 1 Upcoming reservation, 1 Completed session |
| **Demo Admin** | `admin@parkease.com` | `AdminPass123!` | Full access to overview KPIs, facility manager, slot matrix, gate audit logs, user directory, and IoT telemetry |

*(A 1-click **"Demo Switcher"** button is also available in the navbar on every page for instant evaluation).*

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js v18+ (tested on Node v25.8.1)
- npm v9+

### 1. Clone & Install Dependencies
```bash
# Navigate to project folder
cd "d:\Projects\College Project\SETM la"

# Install all frontend and backend dependencies
npm install
```

### 2. Seed Database
```bash
# Populates facilities, slots, IoT sensors, demo users, vehicles, and sample reservations
npm run seed
```

### 3. Run Automated QA Test Suite
```bash
npm test
```
*Executes all 17 automated end-to-end test cases covering registration, overlapping interval conflict rejection, non-overlapping slot reuse, fee calculation, exit settlement, barrier triggers, and access control.*

### 4. Start Local Development Environment
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173) (Proxies `/api` to port 5000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

Alternatively, run server and client individually:
```bash
# Terminal 1: Backend Express Server
npm run server

# Terminal 2: Vite React Frontend
npm run client
```

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register driver account and vehicle
- `POST /api/auth/login` — Sign in and obtain JWT bearer token
- `POST /api/auth/logout` — End session
- `GET /api/auth/me` — Current authenticated driver profile & vehicles
- `PUT /api/auth/profile` — Update name and phone number

### Facilities & Slots
- `GET /api/facilities` — List all facilities with live slot availability counts
- `GET /api/facilities/:id` — Single facility details
- `GET /api/facilities/:id/slots?startTime=&expectedEndTime=&category=` — Real-time slot grid with interval availability calculation

### Vehicles
- `GET /api/vehicles` — Driver's registered vehicle fleet
- `POST /api/vehicles` — Enroll new vehicle
- `PUT /api/vehicles/:id` — Update vehicle
- `DELETE /api/vehicles/:id` — Delete vehicle (protected against active bookings)

### Bookings & Permits
- `POST /api/bookings` — Create reservation with deterministic slot allocation
- `GET /api/bookings` — List driver's reservations (filters: all, upcoming, reserved, checked_in, completed, cancelled)
- `GET /api/bookings/:id` — Single booking details with QR token
- `POST /api/bookings/:id/cancel` — Cancel pending reservation and release bay

### Barrier Gate Control
- `POST /api/entry/validate` — Lookup and verify booking eligibility for gate entry
- `POST /api/entry/confirm` — Check in vehicle, mark slot occupied, open entry boom barrier
- `POST /api/exit/quote` — Compute elapsed duration, billable hours, and fee breakdown
- `POST /api/exit/confirm` — Settle demo payment, complete booking, release slot, open exit barrier

### Payments
- `GET /api/payments` — Driver / Admin settlement invoice ledger
- `GET /api/payments/:id` — Itemized tax invoice receipt

### IoT Telemetry & Administration
- `GET /api/sensors` — Stream of all ground sensor nodes
- `POST /api/sensors/simulate-toggle` — Trigger virtual vehicle arrival / departure
- `GET /api/admin/overview` — High-level KPI metrics & recent barrier logs
- `GET /api/admin/reservations` — Global reservation registry
- `GET /api/admin/logs` — Immutable gate barrier audit trail
- `GET /api/admin/users` — User directory with admin promotion/revocation
- `POST /api/admin/facilities` — Add new parking facility
- `PUT /api/admin/facilities/:id` — Update facility tariff and maintenance state
- `POST /api/admin/slots` — Provision new bay and mapped IoT sensor
- `PUT /api/admin/slots/:id/toggle-maintenance` — Toggle slot out-of-service (with checked-in safeguard)

---

## ☁️ Vercel Deployment Guide

ParkEase includes `vercel.json` configured for serverless API routing (`/api/*` mapped to `server/index.js`) and static frontend serving (`dist/`).

### Production Persistence Note
In local development, the system uses high-performance SQLite in WAL mode. When deploying to serverless environments such as Vercel, the local filesystem is ephemeral. To ensure persistent data across deployments:
1. Create a free project on [Supabase](https://supabase.com) (or any managed PostgreSQL provider).
2. Configure `DATABASE_URL` in your Vercel Project Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
3. Set `JWT_SECRET` in Vercel Environment Variables.
4. Deploy using `vercel deploy` or connect the Git repository.

---

## 🧪 Automated QA Verification Summary

All 16 minimum test requirements specified in the project prompt have been implemented and validated:

```
• 1. A new user can register................................... ✅ PASSED
• 2. Duplicate email registration is rejected.................. ✅ PASSED
• 3. A registered user can log in and log out.................. ✅ PASSED
• 4. A user can add a vehicle.................................. ✅ PASSED
• 5. Available slots are displayed correctly................... ✅ PASSED
• 6. A booking assigns a compatible slot....................... ✅ PASSED
• 7. Two overlapping bookings cannot reserve the same slot..... ✅ PASSED
• 8. Non-overlapping reservations can reuse a slot............ ✅ PASSED
• 9. A valid booking generates a real digital ticket........... ✅ PASSED
• 10. An invalid or cancelled booking cannot check in.......... ✅ PASSED
• 11. Successful entry marks the slot occupied................. ✅ PASSED
• 12. Exit calculates the correct parking fee.................. ✅ PASSED
• 13. Demo payment completes booking & releases slot........... ✅ PASSED
• 14. Duplicate exit payment is prevented...................... ✅ PASSED
• 15. Users cannot access another user's private bookings...... ✅ PASSED
• 16. Non-admin users cannot access admin APIs................. ✅ PASSED
========================================================
  QA TEST RUN COMPLETE: 17 PASSED, 0 FAILED
========================================================
```

---

## 📜 License & Academic Integrity
Developed as a College Engineering Project Prototype for **Smart Parking Management Systems**.
Licensed under ISC.
