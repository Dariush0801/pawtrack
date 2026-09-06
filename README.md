# 🐾 PawTrack - Universal NFC & RFID Pet Recovery Portal

[![Vercel Deployment Ready](https://img.shields.io/badge/Deployment-Vercel%20Ready-black?style=flat&logo=vercel)](https://vercel.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat&logo=github)](https://github.com/Dariush0801/pawtrack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

PawTrack is a modern, unified pet recovery system featuring **Smartphone NFC collar tag tap-to-report**, municipal RFID reader integration, AI pet image identification, 72-hour municipal shelter holding workflows, and interactive community recovery maps.

---

## 🚀 Key Features

- 📱 **Standardized Smartphone NFC Collar Tag**: Passive 13.56 MHz NFC Type 2 tag. Any finder can tap their iPhone or Android phone to instantly open the pet's profile and file a sighting report without installing any app.
- 📡 **Dual-Frequency RFID Support**: Works seamlessly with 134.2 kHz FDX-B municipal handheld scanners and readers.
- 🏢 **Municipal Shelter & Pound Portal**: 72-hour legal holding window tracker, kennel intake logging, and statutory claim verification workflows.
- 🗺️ **Interactive Pet Radar & Maps**: Live incident pins, filter by species/status, and one-touch turn-by-turn navigation.
- 🌐 **Real-Time Cross-Tab & Multi-Role Sync**: Synchronized data stream with BroadcastChannel, Server-Sent Events (SSE), and LocalStorage fallback.
- ⚡ **Zero-Config Vercel Deployment**: Configured with `vercel.json` and serverless API endpoints ready to deploy in seconds.

---

## 🛠️ Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/Dariush0801/pawtrack.git
cd pawtrack
```

### 2. Run the local server
```bash
npm start
# or double click start-server.bat
```
Open `http://localhost:3000` in your web browser.

### 3. Run Automated Verification Tests
```bash
npm test
```

---

## ☁️ Deploying to Vercel

PawTrack is fully configured for zero-configuration deployment on **[Vercel](https://vercel.com)**:

1. Go to **[vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **Add New...** → **Project**.
3. Import the repository: `Dariush0801/pawtrack`.
4. Keep the default settings (Framework Preset: **Other**) and click **Deploy**.
5. Once deployed, Vercel will provide a live production URL (e.g. `https://pawtrack.vercel.app`).

Every commit pushed to the `main` branch will automatically trigger a new deployment on Vercel!

---

## 🔄 Automatic Git Commit & Cloud Sync

To have your local edits automatically committed and pushed to GitHub as you code:

- **Windows**: Double-click `auto-sync.bat` or run:
  ```bash
  npm run sync
  ```
- **Instant 1-Click Push**: Double-click `sync-now.bat` to immediately push all changes.

---

## 📁 Project Architecture

```
PawTrack/
├── api/                   # Vercel serverless API handlers (/api/sync, /api/health)
├── css/                   # Design system tokens and UI components
│   ├── main.css
│   └── components.css
├── js/                    # Application logic, store, views, and controllers
│   ├── app.js
│   ├── i18n.js
│   ├── notifications.js
│   ├── report-manager.js
│   ├── rfid-scanner.js
│   ├── store.js
│   └── views/             # Role-based views (Owner, Shelter, Map, Cases, Hardware)
├── scripts/               # Auto-sync watcher & tooling
├── tests/                 # Automated unit and integration test suites
├── index.html             # Application entry point
├── server.js              # Local Node.js HTTP & SSE server
├── vercel.json            # Vercel routing & serverless configuration
├── auto-sync.bat          # 1-click auto-sync watcher
└── sync-now.bat           # 1-click instant commit & push
```

---

## 📄 License

MIT License © 2026 PawTrack Team.
