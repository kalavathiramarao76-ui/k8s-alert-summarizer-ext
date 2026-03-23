<p align="center"><img src="public/icons/logo.svg" width="128" height="128" alt="KubeSignal Logo"></p>

# KubeSignal — Kubernetes Alert Analyzer

![Version](https://img.shields.io/badge/version-1.0.0-22c55e?style=flat-square)
![License](https://img.shields.io/badge/license-ISC-22c55e?style=flat-square)
![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-22c55e?style=flat-square&logo=googlechrome&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)

> Analyze Kubernetes alerts with AI — get instant severity classification, auto-generated runbooks, alert correlation, and integration with PagerDuty, Grafana, and Datadog.

<p align="center">
  <img src="public/icons/icon128.png" alt="KubeSignal Icon" width="128" />
</p>

## Features

- :mag: **Alert Analysis** — AI-powered analysis of Kubernetes alerts with context and impact assessment
- :blue_book: **Runbook Generation** — Auto-generated runbooks for 12 Kubernetes alert types:
  - PodCrashLooping, OOMKilled, NodeNotReady, ImagePullBackOff
  - HighCPUUsage, HighMemoryUsage, PersistentVolumeError, DeploymentReplicasMismatch
  - EndpointNotReady, CertificateExpiring, IngressError, HPAMaxedOut
- :link: **Alert Correlation** — Identifies related alerts across namespaces and clusters to surface cascading failures
- :rotating_light: **Severity Classifier (P0-P4)** — AI-driven priority classification with confidence scores
- :link: **PagerDuty Integration** — Pull alerts and enrich with K8s context
- :link: **Grafana Integration** — Import alert rules and dashboard annotations
- :link: **Datadog Integration** — Ingest Datadog monitors and events
- :lock: **Firebase Auth** — Secure authentication
- :leaves: **Green Theme** — Clean green-accented dark interface

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS |
| Build | Vite |
| Auth | Firebase |
| Integrations | PagerDuty API, Grafana API, Datadog API |
| Platform | Chrome Extension (Manifest V3) |

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd k8s-alert-summarizer-ext
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Create a `.env` file with Firebase and integration API credentials (PagerDuty, Grafana, Datadog)

4. **Build the extension**
   ```bash
   npm run build
   ```

5. **Load in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `dist` folder

## Usage

### Analyzing an Alert
1. Open KubeSignal from the Chrome toolbar
2. Paste a Kubernetes alert payload (JSON or plain text)
3. Click **Analyze** to get severity classification, root cause, and impact assessment

### Generating a Runbook
1. After analysis, click **Generate Runbook**
2. KubeSignal produces step-by-step remediation instructions
3. Runbooks include kubectl commands, verification steps, and escalation triggers

### Alert Correlation
1. Paste multiple alerts or pull from connected services
2. KubeSignal identifies relationships (e.g., OOMKilled -> NodeNotReady -> PodCrashLooping)
3. View a correlation timeline showing cascade patterns

### Severity Levels

| Level | Severity | Example |
|-------|----------|---------|
| **P0** | Critical | NodeNotReady on multiple nodes, cluster-wide OOM |
| **P1** | High | PodCrashLooping on critical service, PV errors |
| **P2** | Medium | HighCPUUsage, DeploymentReplicasMismatch |
| **P3** | Low | CertificateExpiring (> 7 days), HPAMaxedOut |
| **P4** | Informational | Non-critical image pull retries, endpoint flapping |

### Supported Alert Types

| Alert Type | Runbook |
|-----------|---------|
| PodCrashLooping | Restart analysis, log inspection, resource check |
| OOMKilled | Memory limit tuning, leak detection |
| NodeNotReady | Node health check, kubelet diagnostics |
| ImagePullBackOff | Registry auth, image tag verification |
| HighCPUUsage | Process profiling, HPA configuration |
| HighMemoryUsage | Memory profiling, limit adjustment |
| PersistentVolumeError | PV/PVC binding, storage class check |
| DeploymentReplicasMismatch | Rollout status, scheduler diagnostics |
| EndpointNotReady | Service selector, pod readiness probe |
| CertificateExpiring | Cert-manager renewal, manual rotation |
| IngressError | Ingress controller logs, backend service check |
| HPAMaxedOut | HPA limits, resource quota review |

## Architecture

```
k8s-alert-summarizer-ext/
├── public/
│   └── icons/              # Extension icons (16, 48, 128px)
├── src/
│   ├── components/         # React UI components
│   │   ├── AlertAnalyzer/  # Alert input and analysis view
│   │   ├── RunbookViewer/  # Generated runbook display
│   │   ├── Correlation/    # Alert correlation timeline
│   │   └── SeverityBadge/  # P0-P4 classification badge
│   ├── services/           # PagerDuty, Grafana, Datadog APIs
│   ├── runbooks/           # 12 K8s alert runbook templates
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Alert parsing, severity logic
│   └── App.tsx             # Main entry point
├── manifest.json           # Chrome Manifest V3 config
├── vite.config.ts          # Vite build configuration
├── tailwind.config.js      # Tailwind theme (green)
└── package.json
```

## Screenshots

<p align="center">
  <img src="public/icons/logo.svg" alt="KubeSignal Logo" width="128" />
</p>

| Icon | Size |
|------|------|
| ![Logo](public/icons/logo.svg) | SVG Logo |
| ![16px](public/icons/icon16.png) | 16x16 |
| ![48px](public/icons/icon48.png) | 48x48 |
| ![128px](public/icons/icon128.png) | 128x128 |

## License

ISC
