<div align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Recharts-22B573?style=for-the-badge&logo=recharts&logoColor=white" alt="Recharts" />
</div>

<h1 align="center">Photovoltaic Feasibility Calculator</h1>

<p align="center">
  <strong>A techno-economic analysis tool for off-grid rural microgrid PV + battery installations.</strong>
</p>

<p align="center">
  A web application built to project the 20-year financial feasibility of off-grid microgrid systems, including Net Present Value (NPV), Levelized Cost of Energy (LCOE), and Payback Period.
</p>

<hr />

## Key Features

*   **Financial Projections:** 20-year cash flow modeling based on dynamic user inputs.
*   **Data Visualization:** Interactive bar charts displaying yearly energy savings versus costs.
*   **Tech Stack:** Built with Vite, React 19, and Tailwind CSS 4.
*   **Type Safety:** TypeScript integration for strict cash flow arrays and component props.
*   **Component Design:** Built using Radix UI primitives and custom CSS styling.
*   **Print Ready:** Generates clean, printer-friendly reports directly from the interface.

## Tech Stack

### Core
*   **Build Tool:** Vite
*   **Library:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS 4

### UI & Aesthetics
*   **Component Library:** Radix UI primitives
*   **Charts:** Recharts
*   **Icons & Typography:** Lucide React, Geist font family
*   **Print Utilities:** React-to-print

### Tooling & Infrastructure
*   **Deployment:** GitHub Pages
*   **Linting:** Oxlint

## Getting Started

To run the project locally, follow these steps:

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd photovoltaic-calculator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the application. The application will hot-reload as you make changes.

## Calculation Engine & Mathematics

The core of the application relies on strict mathematical models to simulate a 20-year financial lifespan for a solar installation, tailored for rural BUMDes (Badan Usaha Milik Desa) business models.

### Fixed Constants
*   **Exchange Rate:** Rp 17,887 / USD
*   **Peak Sun Hours (PSH):** 4.96 hours/day
*   **PV Derating Factor:** 80% (0.80)
*   **System Voltage:** 48V DC
*   **Depth of Discharge (DOD):** 80% (0.80)
*   **Battery Efficiency:** 96% (0.96)
*   **Degradation Rate:** 0.5% per year
*   **Battery CAPEX (Sodium-Ion):** Rp 1,400,000 / kWh
*   **OPEX Rate (Year 1):** 2.0% of Gross CAPEX
*   **OPEX Inflation Rate:** 5.0% per year
*   **Real Discount Rate:** 10.0%
*   **Project Lifespan:** 20 Years
*   **Diesel LCOE Baseline:** $1.23 / kWh

### Technical Sizing & Year 0 Investment
1.  **Min PV Required (kWp):** `Daily Load / (PSH * PV Derating)`
2.  **Battery Capacity (kWh):** `(Daily Load * Days of Autonomy) / (DOD * Battery Efficiency)`
3.  **Gross CAPEX:** `(System Capacity * PV CAPEX) + (Battery Capacity * Battery CAPEX)`
4.  **Net CAPEX:** `Gross CAPEX * (1 - (Government Subsidy / 100))` (The out-of-pocket cost for BUMDes).

### 20-Year Projection Loop
The projection maintains an array where **Year 0** represents the initial investment (`Cumulative Cash Flow = -Net CAPEX`). For **Year 1 to 20**, the engine iterates dynamically:

*   **Energy Produced (Year T):** `Energy (T-1) * (1 - Degradation Rate)`
*   **Revenue (Flat):** `Daily Load * 365 * BUMDes Tariff`
*   **OPEX (Year T):** `OPEX (T-1) * (1 + OPEX Inflation Rate)`
*   **Battery Replacement:** Triggered at Year 10 (Full cost of new batteries based on capacity).
*   **Net Cash Flow (Year T):** `Revenue - OPEX (Year T) - Battery Replacement (if applicable)`
*   **Cumulative Cash Flow (Year T):** `Cumulative Cash Flow (T-1) + Net Cash Flow (T)`

### Key Performance Indicators (KPIs)

#### 1. Net Present Value (NPV)
NPV determines the current value of all future cash flows over the 20-year period.
*   **Formula:** $\sum_{t=1}^{20} \frac{\text{Net Cash Flow}_t}{(1 + r)^t} - \text{Total CAPEX}$
*   Where $r$ is the Real Discount Rate (10.0%).

#### 2. Levelized Cost of Energy (LCOE)
LCOE represents the average revenue per unit of electricity served that would be required to recover the costs of building and operating the plant.
*   **Formula:**

```math
\text{LCOE} = \frac{\text{Gross CAPEX} + \sum_{t=1}^{20} \frac{\text{OPEX}_{t} + \text{Battery Replacement}_{t}}{(1 + r)^{t}}}{\sum_{t=1}^{20} \frac{\text{Energy Served}_{t}}{(1 + r)^{t}}}
```

*   **Note:** Gross CAPEX is placed at Year 0 and is not re-discounted. Both the costs and the total energy served (Daily Load * 365) from Year 1 to 20 are discounted using the same real discount rate $r$.

#### 3. Payback Period
The exact decimal year when the cumulative cash flow transitions from negative to positive.
*   The application iterates through the 20-year array. When `Cumulative Cash Flow (Year T) >= 0` and `(Year T-1) < 0`, it applies linear interpolation for precision:
*   `Fraction = Absolute(Cumulative Cash Flow T-1) / Net Cash Flow T`
*   `Payback Period = (T - 1) + Fraction`
*   If the cumulative cash flow never becomes positive within 20 years, it returns `> 20 Years`.

## Project Structure

```text
photovoltaic-calculator/
├── src/
│   ├── assets/        # Static assets and images
│   ├── components/    # Reusable UI elements (Header, Forms, Charts)
│   │   └── ui/        # Base components (Slider, Select, Label)
│   ├── lib/           # Utility functions for styling (cn)
│   ├── utils/         # Helper functions (formatters)
│   ├── App.tsx        # Main application layout and engine logic
│   ├── main.tsx       # React root execution
│   └── types.ts       # TypeScript interfaces (YearlyData)
├── public/            # Public static files
└── ...
```

<hr />
<p align="center">
  Built for techno-economic feasibility analysis of off-grid microgrid solar systems.
</p>
