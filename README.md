<div align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Recharts-22B573?style=for-the-badge&logo=recharts&logoColor=white" alt="Recharts" />
</div>

<h1 align="center">Photovoltaic Feasibility Calculator</h1>

<p align="center">
  <strong>A techno-economic analysis tool for rooftop solar PV installations.</strong>
</p>

<p align="center">
  A web application built to project the 20-year financial feasibility of rooftop solar systems, including Net Present Value (NPV), Levelized Cost of Energy (LCOE), and Payback Period.
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

The core of the application relies on strict mathematical models to simulate a 20-year financial lifespan for a solar installation, compliant with the latest Indonesian regulations (Permen ESDM No. 2 Tahun 2024).

### Fixed Constants
*   **Peak Sun Hours (PSH):** 4.10 hours/day
*   **Performance Ratio (PR):** 78% (0.78)
*   **Degradation Rate:** 0.5% per year
*   **OPEX Rate (Year 1):** 1.25% of CAPEX
*   **General Inflation Rate:** 5.0% per year (used for OPEX escalation)
*   **Tariff Inflation Rate:** 3.0% per year (used for Utility Tariff escalation)
*   **Inverter Replacement:** 8% of CAPEX at Year 10
*   **Real Discount Rate:** 6.07%
*   **Project Lifespan:** 20 Years
*   **Export Tariff:** Rp 0 / kWh (Net-billing regulation: excess energy to grid is not compensated)

### Year 1 Baseline Metrics
1.  **Total CAPEX:** `System Capacity (kWp) * Installation Cost (Rp/kWp)`
2.  **Energy Production (Year 1):** `System Capacity * PSH * 365 days * Performance Ratio`
3.  **Savings (Year 1):** `Energy Production * Self-Consumption Ratio * Utility Tariff`. (Any remaining energy is exported to the grid at Rp 0 / kWh).

### 20-Year Projection Loop
The projection maintains an array where **Year 0** represents the initial investment (`Cumulative Cash Flow = -Total CAPEX`). For **Year 1 to 20**, the engine iterates dynamically:

*   **Energy Produced (Year T):** `Energy (T-1) * (1 - Degradation Rate)`
*   **Utility Tariff (Year T):** `Tariff (T-1) * (1 + Tariff Inflation Rate)`
*   **OPEX (Year T):** `OPEX (T-1) * (1 + General Inflation Rate)`
*   **Savings (Year T):** `Energy (T) * Self-Consumption Ratio * Tariff (T)`
*   **Total Cost (Year T):** `OPEX (Year T) + Inverter Replacement Cost (if Year == 10)`
*   **Net Cash Flow (Year T):** `Savings (Year T) - Total Cost (Year T)`
*   **Cumulative Cash Flow (Year T):** `Cumulative Cash Flow (T-1) + Net Cash Flow (T)`

### Key Performance Indicators (KPIs)

#### 1. Net Present Value (NPV)
NPV determines the current value of all future cash flows over the 20-year period.
*   **Formula:** `NPV = SUM[t=1..20]( Net_Cash_Flow(t) / (1+r)^t ) - Total_CAPEX`
*   Where `r` is the Real Discount Rate (6.07%).

#### 2. Levelized Cost of Energy (LCOE)
LCOE represents the average revenue per unit of electricity generated that would be required to recover the costs of building and operating the plant.

```
        CAPEX + SUM[t=1..20]( (OPEX(t) + Replacement(t)) / (1+r)^t )
LCOE = ---------------------------------------------------------------
               SUM[t=1..20]( Energy(t) / (1+r)^t )
```

*   **Note:** CAPEX is placed at Year 0 and is not re-discounted. Both the costs and the total energy produced from Year 1 to 20 are discounted using the same real discount rate `r`.

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
  Built for techno-economic feasibility analysis of rooftop solar systems.
</p>
