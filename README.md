<p align="center">
  <img src="public/logo.png" alt="Sentinel Vision Logo" width="80" />
</p>

<h1 align="center">🛡️ Sentinel Vision — Cyber Sight Analyzer</h1>

<p align="center">
  <strong>AI-Powered Website Malware & Phishing Detection Platform</strong>
</p>

<p align="center">
  An enterprise-grade Security Operations Center (SOC) platform that leverages an ensemble of deep learning models — CNN, XGBoost, and Transformer networks — combined with six global threat intelligence feeds to classify, analyze, and explain web-based cyber threats in real time.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## 📋 Overview

**Sentinel Vision (Cyber Sight Analyzer)** is a full-stack AI-powered cybersecurity platform designed to scan, classify, and analyze websites for malware, phishing, and other cyber threats. It combines multiple machine learning models in an ensemble architecture with real-world threat intelligence feeds to deliver accurate, explainable threat verdicts.

### What It Does

1. **Scans any URL** — Performs DNS lookup, SSL/TLS inspection, HTML parsing, and JavaScript analysis
2. **Classifies threats** — Uses an ensemble of CNN, XGBoost, and Transformer models to determine if a site is malicious
3. **Identifies malware families** — Classifies threats into families: Adware, Trojan, Ransomware, Worm, or Benign
4. **Detects zero-day threats** — Uses Isolation Forest anomaly detection for previously unseen attack patterns
5. **Explains decisions** — Provides SHAP feature importance and Grad-CAM visualizations for model transparency
6. **Cross-references threat intelligence** — Checks against VirusTotal, Google Safe Browsing, AbuseIPDB, AlienVault OTX, URLHaus, and PhishTank
7. **Generates actionable reports** — Exports results as JSON, CSV, or printable PDF reports

---

## ✨ Features

### 🤖 Machine Learning Pipeline

| Model | Purpose | Framework |
|-------|---------|-----------|
| **CNN (Convolutional Neural Network)** | Malware image classification from binary-to-image conversion | TensorFlow/Keras |
| **XGBoost** | Feature-based malware detection using static & dynamic features | XGBoost |
| **Transformer** | Sequence-based malware family classification | PyTorch |
| **Isolation Forest** | Zero-day / anomaly detection for unknown threats | Scikit-learn |
| **Ensemble Predictor** | Confidence-weighted voting across all models | Custom |

### 🔍 Scanning & Analysis

- **DNS Analysis** — A/MX/TXT records, SPF/DKIM/DMARC validation, nameserver inspection
- **SSL/TLS Deep Inspection** — Certificate chain validation, cipher strength, issuer analysis, expiration checks
- **WHOIS Intelligence** — Domain age, registrar, owner, newly-registered domain detection
- **HTML Analysis** — Hidden iframes, external scripts, obfuscated content, suspicious form detection
- **JavaScript Analysis** — Obfuscation detection, eval() usage, encoded payloads, cryptomining scripts
- **Network Resource Mapping** — External domains, suspicious third-party resources, beacon detection
- **Security Headers Audit** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and more

### 🌐 Threat Intelligence Integration

| Feed | Coverage |
|------|----------|
| **VirusTotal** | Multi-engine malware scanning |
| **Google Safe Browsing** | Phishing & social engineering |
| **AbuseIPDB** | IP reputation & abuse history |
| **AlienVault OTX** | Indicators of Compromise (IOCs) |
| **URLHaus** | Malware distribution URLs |
| **PhishTank** | Community-verified phishing |

### 🧠 Explainable AI (XAI)

- **SHAP (SHapley Additive exPlanations)** — Feature importance visualization showing exactly which features drove the verdict
- **Grad-CAM** — CNN attention heatmaps highlighting suspicious image regions
- **Top Feature Breakdown** — Human-readable explanation of why a site was flagged (high entropy, suspicious APIs, etc.)

### 🗺️ MITRE ATT&CK Mapping

Automatically maps observed behaviors to MITRE ATT&CK techniques:
- `T1189` — Drive-by Compromise
- `T1027` — Obfuscated Files or Information
- `T1027.002` — Software Packing
- `T1106` — Native API (Process Injection)

### 📊 SOC Dashboard

- Real-time threat distribution (pie charts, radial bars)
- Monthly scan & threat trends (line charts)
- Threat intelligence source hit rates
- Website category breakdown
- Geographic distribution of scanned hosts
- Risk level distribution across all scans

### 📦 Report Export

- **JSON** — Full structured scan data
- **CSV** — Tabular summary for spreadsheet analysis
- **PDF** — Printable browser-based report

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  TanStack Router · Recharts · Framer Motion · Tailwind CSS      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Landing  │  │Dashboard │  │  Scan    │  │   History      │   │
│  │  Page    │  │   SOC    │  │ Results  │  │    Table       │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────────┐
│                     Backend (FastAPI)                            │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │  URL Scanner│  │ Feature      │  │  ML Ensemble Engine   │   │
│  │  DNS/SSL/   │  │ Extraction   │  │                       │   │
│  │  HTML/JS    │  │ Static +     │  │  CNN ─┐               │   │
│  │  Analysis   │  │ Dynamic      │  │  XGB ─┼─▶ Ensemble    │   │
│  └─────────────┘  └──────────────┘  │  TF  ─┘   Predictor  │   │
│                                     └───────────────────────┘   │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │ Zero-Day    │  │ Explainable  │  │  Threat Intelligence  │   │
│  │ Detector    │  │ AI (SHAP /   │  │  VirusTotal · MITRE   │   │
│  │ (Isolation  │  │  Grad-CAM)   │  │  ATT&CK Mapping       │   │
│  │  Forest)    │  │              │  │                       │   │
│  └─────────────┘  └──────────────┘  └───────────────────────┘   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │  Auth (JWT) │  │ Celery Tasks │  │  PostgreSQL + Redis   │   │
│  └─────────────┘  └──────────────┘  └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TanStack Router** | Type-safe file-based routing |
| **TanStack Query** | Server state management |
| **Vite 8** | Build tool & dev server |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Data visualization (charts & graphs) |
| **Radix UI** | Accessible, headless component primitives |
| **Lucide React** | Icon library |
| **Zod** | Schema validation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.11+** | Runtime |
| **FastAPI** | REST API framework |
| **TensorFlow 2.16+** | CNN model training & inference |
| **PyTorch 2.2+** | Transformer model inference |
| **XGBoost 2.0+** | Gradient boosted tree classifier |
| **Scikit-learn** | Isolation Forest anomaly detection |
| **SHAP** | Model explainability |
| **OpenCV** | Binary-to-image conversion for CNN |
| **Celery + Redis** | Async task queue for scan jobs |
| **SQLAlchemy + PostgreSQL** | ORM & database |
| **YARA** | Malware pattern matching rules |
| **python-jose** | JWT authentication |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.11
- **PostgreSQL** ≥ 14
- **Redis** ≥ 7.0 (for Celery task queue)

### 1. Clone the Repository

```bash
git clone https://github.com/ruparaghuraman-ship-it/cyber-sight-analyzer.git
cd cyber-sight-analyzer
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 3. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Security
SECRET_KEY=your_super_secret_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/malware_db

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# External APIs (Optional)
VIRUSTOTAL_API_KEY=your_virustotal_api_key
```

### 5. Database Setup

```bash
# Create the PostgreSQL database
createdb malware_db

# Tables are auto-created on first run via SQLAlchemy
```

### 6. Start the Backend

```bash
# Start the FastAPI server
uvicorn main:app --reload --port 8000

# In a separate terminal, start the Celery worker (optional, for async scans)
celery -A app.worker worker --loglevel=info
```

### 7. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **API Docs (ReDoc)** | http://localhost:8000/redoc |
| **Health Check** | http://localhost:8000/health |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and get JWT token |

### Scanning

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/scan` | Submit a URL for scanning |
| `GET`  | `/api/v1/scan/{id}` | Get scan results by ID |
| `GET`  | `/api/v1/scan/history` | Get scan history for the user |

### Training

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/retrain` | Trigger model retraining |
| `GET`  | `/api/v1/training/status` | Check training status |

### Example: Submit a Scan

```bash
curl -X POST http://localhost:8000/api/v1/scan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## 📁 Project Structure

```
cyber-sight-analyzer/
├── public/                          # Static assets
│   └── logo.png                     # Application logo
├── src/                             # Frontend source code
│   ├── components/
│   │   ├── soc/
│   │   │   ├── Shell.tsx            # App shell with navigation
│   │   │   ├── ScanInput.tsx        # URL input component
│   │   │   └── ThreatGauge.tsx      # Radial threat score gauge
│   │   └── ui/                      # Reusable UI primitives (Radix-based)
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utilities & mock data
│   ├── routes/
│   │   ├── index.tsx                # Landing page with hero & features
│   │   ├── dashboard.tsx            # SOC dashboard with charts
│   │   ├── history.tsx              # Scan history table
│   │   └── scan.$id.tsx             # Detailed scan results page
│   ├── styles.css                   # Global styles & design tokens
│   ├── router.tsx                   # TanStack Router config
│   └── routeTree.gen.ts             # Auto-generated route tree
├── backend/                         # Python backend
│   ├── main.py                      # FastAPI app entry point
│   ├── requirements.txt             # Python dependencies
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py              # Dependency injection
│   │   │   └── routes/
│   │   │       ├── auth.py          # Authentication endpoints
│   │   │       ├── scan.py          # Scan endpoints
│   │   │       └── training.py      # Model training endpoints
│   │   ├── core/
│   │   │   ├── config.py            # App configuration (Pydantic)
│   │   │   └── security.py          # JWT & password hashing
│   │   ├── database/
│   │   │   ├── models.py            # SQLAlchemy ORM models
│   │   │   └── session.py           # Database session factory
│   │   ├── feature_extraction/
│   │   │   ├── static.py            # PE analysis, entropy, strings
│   │   │   └── dynamic.py           # Sandbox behavioral features
│   │   ├── ml/
│   │   │   ├── cnn/
│   │   │   │   └── inference.py     # CNN image-based classification
│   │   │   ├── xgboost/
│   │   │   │   └── inference.py     # XGBoost feature-based detection
│   │   │   ├── transformer/
│   │   │   │   └── inference.py     # Transformer sequence classification
│   │   │   ├── ensemble.py          # Confidence-weighted ensemble predictor
│   │   │   ├── explainability/
│   │   │   │   └── explainer.py     # SHAP & Grad-CAM explanations
│   │   │   ├── image_gen.py         # Binary-to-image conversion
│   │   │   └── zero_day/
│   │   │       └── anomaly.py       # Isolation Forest anomaly detector
│   │   ├── schemas/
│   │   │   ├── scan.py              # Pydantic scan schemas
│   │   │   └── user.py              # Pydantic user schemas
│   │   ├── services/
│   │   │   └── scanner.py           # URL scanner (DNS, SSL, HTML)
│   │   ├── tasks/
│   │   │   └── scan_tasks.py        # Celery async scan tasks
│   │   ├── threat_intelligence/
│   │   │   ├── mitre.py             # MITRE ATT&CK technique mapper
│   │   │   └── virustotal.py        # VirusTotal API integration
│   │   ├── training/
│   │   │   └── retrain.py           # Model retraining pipeline
│   │   ├── utils/                   # Utility functions
│   │   └── worker.py                # Celery worker configuration
├── datasets/                        # Training datasets (git-ignored)
├── saved_models/                    # Trained model files (git-ignored)
├── uploads/                         # Uploaded files for scanning (git-ignored)
├── package.json                     # Node.js dependencies
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
└── .gitignore                       # Git ignore rules
```

---

## 🔬 How the ML Pipeline Works

### 1. Feature Extraction

```
Uploaded File / URL
       │
       ├──▶ Static Analysis
       │     ├── Shannon Entropy calculation
       │     ├── PE header parsing (MZ signature)
       │     ├── Imported DLL enumeration
       │     └── Suspicious string matching (cmd.exe, powershell, VirtualAlloc...)
       │
       └──▶ Dynamic Analysis (Sandbox)
             ├── API call sequences (CreateRemoteThread, WriteProcessMemory...)
             ├── Registry modifications
             ├── Network traffic (C2 beacons)
             └── File system activity
```

### 2. Ensemble Classification

```
Features ──▶ CNN (binary image)        weight: 0.4 ──┐
         ──▶ XGBoost (feature vector)  weight: 0.3 ──┼──▶ Weighted Vote ──▶ Final Verdict
         ──▶ Transformer (sequence)    weight: 0.3 ──┘
                                                          │
                                                          ▼
                                                   Risk Level:
                                                   > 0.8 → Critical
                                                   > 0.6 → High
                                                   > 0.5 → Medium
                                                   ≤ 0.5 → Low
```

### 3. Zero-Day Detection

When the ensemble confidence is below 60%, the system engages the **Isolation Forest** anomaly detector to check if the sample exhibits patterns outside the known threat landscape — potentially indicating a zero-day threat.

### 4. Explainability

After classification, the system generates:
- **SHAP values** — Showing which features (entropy, suspicious strings, API calls) contributed most to the verdict
- **Grad-CAM heatmaps** — Highlighting regions of the binary image that the CNN focused on

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
pytest --asyncio-mode=auto

# Frontend lint
npm run lint
```

---

## 📈 Roadmap

- [ ] Real-time WebSocket scan progress streaming
- [ ] Multi-user role-based access control (RBAC)
- [ ] Automated model retraining on new labeled samples
- [ ] Browser extension for on-the-fly URL scanning
- [ ] STIX/TAXII threat intelligence feed ingestion
- [ ] Docker & Docker Compose deployment
- [ ] Kubernetes Helm chart for production deployment
- [ ] CI/CD pipeline with GitHub Actions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Coding Standards

- **Frontend**: Follow ESLint + Prettier configuration provided
- **Backend**: Follow PEP 8 style guidelines
- **Commits**: Use conventional commit messages

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Rupa Raghuraman**

- GitHub: [@ruparaghuraman-ship-it](https://github.com/ruparaghuraman-ship-it)

---

<p align="center">
  <strong>Built with ❤️ for cybersecurity</strong>
</p>
