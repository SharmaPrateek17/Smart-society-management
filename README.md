# Smart Society Management & Collective Service Procurement Platform

A web platform that digitizes residential society management while enabling residents to pool service demands (AC servicing, plumbing, pest control, deep cleaning) so societies can negotiate bulk pricing with verified vendors.

Built strictly according to the **Product Requirements Document (PRD)** with:
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: Express.js + Node.js (REST API, JWT Authentication, RBAC)
- **Database**: Relational SQL database managed via **Prisma ORM** (defaulting to SQLite for zero-configuration local execution, instantly switchable to PostgreSQL via `.env`)
- **Demo Mode**: Built-in 1-Click **Role Switcher** to evaluate all 4 user personas without typing credentials.

---

## 🏢 4 Portals & User Personas

| Persona | Key Capabilities | Demo Login |
|---|---|---|
| **Resident** | Raise service requests (individual or pooled), track status across 6-stage lifecycle (`Raised → Pooled → Assigned → In Progress → Completed → Rated`), file maintenance complaints, view notice board, view dues & download digital receipts, submit star reviews. | `resident1@greenvalley.com` / `resident123` |
| **Society Admin / Secretary** | Manage demand pooling cycles, invite verified service vendors to bid, evaluate bids on the **Side-by-Side Quotation Comparison Board**, award contracts, manage flats & resident directory, resolve complaints, publish notices, log dues. | `admin@greenvalley.com` / `admin123` |
| **Vendor / Contractor** | Receive invitations to bid on high-volume apartment pools, submit bulk quotations (price per unit, terms, availability), view assigned contracts with resident contact list, update job progress, view verified resident ratings. | `vendor.ac@coolair.com` / `vendor123` |
| **Super Admin** | Onboard new residential societies, manage society admin mapping, verify or reject vendor registrations, view platform-wide demand aggregation metrics and community savings. | `superadmin@smartnexus.com` / `admin123` |

---

## 🔄 Core User Flow: Demand Aggregation & Collective Procurement

```
[Resident A, B, C]
    │ Raise "AC Servicing" requests
    ▼
[Service Demand Pool] ──── (Automatically groups by Society + Category + Cycle)
    │ Admin closes/reviews pool (e.g. 4 flats pooled)
    ▼
[Vendor Invitations] ─────► Admin invites verified vendors (CoolAir, UrbanCool, etc.)
    │
    ▼
[Quotation Board] ──────── Vendors submit bulk quotes (e.g. $24/unit vs $45 market rate)
    │
    ▼
[Side-by-Side Comparison] ─ Admin reviews price, vendor star rating, and resident savings
    │ Admin awards contract
    ▼
[Execution & Status] ───── Status updates to ASSIGNED -> IN_PROGRESS -> COMPLETED
    │
    ▼
[Resident Rating] ──────── Residents submit 1-5 star reviews that update Vendor's public score
```

---

## 🗄️ Relational Database Schema (SQL / Prisma)

Strictly matching Section 9 of the PRD:
- `users`: User profiles with roles (`RESIDENT`, `ADMIN`, `VENDOR`, `SUPER_ADMIN`), society foreign key, flat numbers.
- `societies`: Apartment societies, address, total flats, admin mapping.
- `service_categories`: Service catalog (AC, Plumbing, Pest Control, Cleaning, RO) with market benchmark prices.
- `service_requests`: Individual requests with status lifecycle, linked to pools.
- `service_pools`: Aggregation cycles with cycle start/end, society and category linkage.
- `vendors`: Business profiles, verification status, aggregate ratings.
- `vendor_invitations`: Pool-to-vendor invitations.
- `quotations`: Bids submitted per pool by vendors (price per flat, terms, total estimate).
- `pool_vendor_selection`: Record of winning vendor awarded by society admin.
- `complaints`: Resident complaints with status tracking (`OPEN → IN_REVIEW → RESOLVED → CLOSED`).
- `notices`: Society-wide announcements categorized by type (Maintenance, Water, Events, General).
- `payments`: Monthly maintenance records, payment status, and digital receipts.
- `ratings`: Post-completion 1–5 star reviews and feedback.
- `documents`: Society bylaws, audit balance sheets, and meeting minutes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Running the Application

1. **Start the Backend API Server:**
   ```bash
   cd server
   npm install
   npm run db:push   # syncs relational SQL schema to dev.db
   npm run db:seed   # seeds realistic demo societies, pools, and bids
   npm start         # runs on http://localhost:5000
   ```

2. **Start the Frontend Client (in a separate terminal):**
   ```bash
   cd client
   npm install
   npm run dev       # runs on http://localhost:5173
   ```

3. Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing with the Role Switcher
In the top navigation bar, click the **Role Switcher** button:
- Switch to **Society Admin** to view the active AC Servicing pool with 3 pooled flats, inspect quotes from *CoolAir* and *UrbanCool*, and award the contract.
- Switch to **Vendor** to view invited pools, submit custom bulk prices per unit, and view confirmed jobs.
- Switch to **Resident** to raise new requests, track existing ones, and rate vendors after service completion.
- Switch to **Super Admin** to onboard new societies and approve pending vendors.
