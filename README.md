# 🥚 Bachelor Egg Manager

An enterprise-grade, modern web application designed for shared bachelor households to maintain full transparency over common egg inventory stock, individual consumption logging, dynamic batch pricing, individual pending bill calculations, audit trail logging, and automated email alerts.

---

## 🌟 Key Features

* **Dual-Mode Persistence**:
  * **Interactive Mock / Local Demo Mode**: Works out of the box in the browser with pre-seeded data (`Batch-001`, Admin `rajesherode2004@gmail.com`, users, consumption history).
  * **Live Supabase Integration**: Automatically connects to your Supabase PostgreSQL database when environment variables are set.
* **Batch Pricing Engine (`Batch-001`, `Batch-002`, ...)**:
  * Admin purchases batches of eggs (e.g. 30 eggs @ ₹210 = ₹7/egg).
  * Historical records preserve unit prices even when new batches are purchased at updated rates (e.g. ₹240 = ₹8/egg).
* **+1 Egg Consumption**:
  * Quick logging with confirmation dialogs.
  * Instant calculation of personal pending amounts and house stock reduction.
* **Depletion Locking & Automated Email Notification**:
  * When stock hits **0**, the `+1 Egg` button locks with a red alert banner.
  * An automated email notification is sent to Admin (`rajesherode2004@gmail.com`) via **Resend API** detailing total eggs finished and individual user breakdowns.
* **Admin Management Dashboard**:
  * Comprehensive metrics (Total Users, Stock, Today's Consumption, Pending Amounts).
  * **Recharts** analytics for Daily Consumption trends and Top Consumer distribution.
  * Full User Directory with auto-generated custom User IDs (e.g., `RAJ001`, `HAR002`, `KAR003`).
* **Reporting & Export**:
  * Filterable consumption log tables.
  * One-click export to **Excel CSV** and formatted **PDF Reports**.
* **Modern UI & Theme**:
  * Dark / Light mode switcher.
  * Glassmorphism cards with smooth micro-animations.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS, CSS Custom Variables, Lucide Icons, Framer Motion
* **Charts**: Recharts
* **Export Utilities**: jsPDF, jsPDF-AutoTable
* **Database & Auth**: Supabase (PostgreSQL, Row-Level Security)
* **Email Service**: Resend API

---

## 📁 Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Email Notification Service
VITE_RESEND_API_KEY=re_123456789_your_resend_api_key

# Admin Email Configuration
VITE_ADMIN_EMAIL=rajesherode2004@gmail.com
```

---

## 🚀 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/bachelor-egg-manager.git
   cd bachelor-egg-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 🗄️ Supabase Database Setup

1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase_schema.sql`](./supabase_schema.sql) provided in this repository.
4. Copy your **API URL** and **anon Key** into your `.env` file (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

---

## ☁️ Vercel Deployment Instructions

1. Push your repository to **GitHub**.
2. Connect your repository to **Vercel** (`https://vercel.com/new`).
3. Set the build parameters:
   * **Framework Preset**: Vite
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Add Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RESEND_API_KEY`) in the Vercel Dashboard project settings.
5. Click **Deploy**!

---

## 👥 Roles & Authorization

* **Admin (`rajesherode2004@gmail.com`)**: Complete authority over batch creation, price updates, user additions, status toggling, and analytics views.
* **Users (`RAJ001`, `KAR002`, `HAR003`, ...)**: Can log egg consumption, view personal pending bills, track house stock, and export individual reports.
