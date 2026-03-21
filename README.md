# ECO-ROUTE AI 🌍🐾

A multi-stakeholder environmental intelligence platform. It empowers governments to plan sustainably, forest officers to protect wildlife efficiently, and citizens to travel safely and responsibly.

## Stakeholder Architecture

### 🏛️ Higher Authorities (Planning & Policy)
- **Wildlife Corridor Planning Intelligence**: Maps showing animal movement to decide safe highway expansions.
- **Deforestation Monitoring**: Satellite-based forest loss trends.
- **Sustainable Road Planning**: AI-assisted environmental impact assessment.
- **National Wildlife Safety Dashboard**: Analytics on high accident zones.

### 🌲 Forest Officers (Field Operations)
- **Wildlife Movement Prediction**: Real-time habitat risk heatmaps for smart patrolling.
- **Roadkill Prevention Alerts**: Danger zone predictions.
- **Citizen Report Monitoring**: Crowd-sourced rescue operation tracking.
- **Habitat Health**: Water source and degradation mapping.

### 🚗 General Users (Drivers / Citizens)
- **Eco-Safe Route Navigation**: Routing options prioritizing wildlife safety.
- **Wildlife Crossing Alerts**: Real-time driving warnings.
- **Route Environmental Impact Score**: Gamified eco-driving metrics.
- **Citizen Reporting**: Report animal sightings or dangers directly to officers.

## 🏗️ Monorepo Structure

```text
root/
├── apps/
│   ├── web/                → Next.js app (App Router)
│   └── api/                → FastAPI gateway/service
├── services/               → Microservices (Auth, AI, Analytics)
├── packages/               → Shared code (UI, Config, Types, Utils)
├── infra/                  → Docker, K8s, Terraform, MCP
├── ai/                     → Training, Datasets, Experiments
├── tests/                  → Unit, Integration, E2E, Load Tests
└── docs/                   → Architecture, API, Deployment Docs
```

## 🚀 Getting Started

### 1. Infrastructure (Redis)
Start the Redis stack (with GUI):
```bash
docker-compose up -d
```
Access the **Redis Insight GUI** at: [http://localhost:8001](http://localhost:8001)

### 2. Backend (FastAPI)
You'll need **Python 3.12.7** for this project.
```bash
cd apps/api
py -3.12 -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Swagger Docs: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

### 3. Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev
```
Website: [http://localhost:3000](http://localhost:3000)
