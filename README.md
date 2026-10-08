# 🌾 AgriAdvisor AI

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

**AgriAdvisor AI** is a deterministic, multi-agent agronomy platform built for enterprise farms. It replaces generic, hallucination-prone LLM wrappers with a verifiable "glass box" architecture, delivering autonomous crop intelligence, yield scoring, and pathogen risk assessment in real-time.

---

## 🚀 Live Demo
**[Insert Vercel Link Here]**

---

## 🧠 The 3-Agent "Glass Box" Architecture

AgriAdvisor AI utilizes a cascading multi-agent workflow. Instead of generating conversational text, agents are strictly constrained to output deterministic JSON schemas, ensuring every agricultural intervention is verifiable and actionable. 

1. **Phase 1: Soil & Triage Orchestrator** 
   Ingests raw farmer telemetry (e.g., soil pH, moisture, nitrogen levels, visual symptoms) and classifies agronomic anomalies.
2. **Phase 2: Climate & Pathogen Risk Worker** 
   Cross-references the triage output against live environmental data to calculate a composite Crop Risk Score (0-100) and forecast yield impact.
3. **Phase 3: Agronomy Arbiter** 
   Synthesizes the pipeline data to autonomously approve targeted treatments (e.g., NPK fertilizer dosages) or escalate critical pathogen threats to a human agronomist. 

*(Pipeline execution averages <250ms)*

---

## ✨ Key Features

* **Real-Time Telemetry Dashboard:** Live tracking of monitored fields, active advisories, composite risk metrics, and mean agent latency.
* **Model Confusion Matrix:** Total transparency into classification precision across multi-vector soil and biological tests.
* **Cinematic, Hardware-Accelerated UI:** A premium, enterprise-grade interface featuring fluid Framer Motion animations, glassmorphism, and a dynamic cosmic aurora environment.
* **Auto-Compiled Field Evidence:** Seamless tracking from initial farmer observation to final AI prescription.

---

## 🛠️ Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Framer Motion (Deployed on Vercel)
* **Backend:** Node.js, Express, REST API (Deployed on Render/Railway)
* **Database & Authentication:** Supabase (PostgreSQL)
* **AI Orchestration:** Multi-agent schema enforcement via Gemini/LLM APIs

---

## 💻 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone [https://github.com/Shreniksk03/agriadvisor-ai.git](https://github.com/Shreniksk03/agriadvisor-ai.git)
cd agriadvisor-ai

cd backend
npm install

PORT=5001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_key
GEMINI_API_KEY=your_api_key

cd ../frontend
npm install

npm run dev

👨‍💻 Developed By
Shrenik S K and team[power_coders]

Lead Architect & Full-Stack Developer
