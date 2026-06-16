# RealVeritas AI

<p align="center">
  <h1 align="center">Real✓eritas AI</h1>
  <p align="center">
    Explainable AI-Driven Real-Time Multi-Modal Digital Media Verification System
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Under%20Development-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/UI-TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## Overview

RealVeritas AI is an Explainable AI-powered digital media verification platform designed to identify manipulated and AI-generated content across multiple media formats.

The system analyzes:

* 🖼️ Images
* 🎥 Videos
* 🎙️ Audio
* 📝 Text

and classifies them as:

* ✅ Authentic
* ⚠️ Manipulated
* 🤖 AI-Generated

Unlike traditional verification systems, RealVeritas AI combines Multi-Modal Analysis with Explainable AI (XAI) to provide transparent and trustworthy results.

---

## Key Features

### Multi-Modal Verification

Analyze multiple content types through dedicated verification modules:

* Image Verification
* Video Verification
* Audio Verification
* Text Verification

### Explainable AI

The system not only predicts results but also explains them through:

* Confidence Scores
* Highlighted Regions
* Heatmaps
* Reasoning Panels

### User Dashboard

* Authentication System
* Verification History
* Analytics Dashboard
* User Profile Management
* Dark / Light Mode

### Scalable Architecture

* Modular Design
* Cloud Ready
* Docker Compatible
* Independent Module Development

---

## Project Architecture

```text
User
 │
 ▼
Authentication
 │
 ▼
Dashboard
 │
 ├── Image Verification
 ├── Video Verification
 ├── Audio Verification
 └── Text Verification
 │
 ▼
AI Analysis Engine
 │
 ▼
Explainability Layer
 │
 ▼
Results & History
```

## Workflow

```text
Upload Media
      │
      ▼
Preview Content
      │
      ▼
Preprocessing
      │
      ▼
AI Analysis
      │
      ▼
Multi-Modal Verification
      │
      ▼
Explainability Engine
      │
      ▼
Final Result
```

## Technology Stack

### Frontend

* React.js
* React Router
* Tailwind CSS

### AI & Processing

* TensorFlow
* PyTorch
* OpenCV
* Librosa

### Backend (Planned)

* FastAPI

### Deployment

* Docker
* Cloud Infrastructure

---

## Project Modules

### User Interface Module

Handles:

* Landing Page
* Dashboard
* Navigation
* User Interaction

### Authentication Module

Handles:

* Login
* Signup
* Forgot Password
* Session Management

### Preprocessing Module

Handles:

* Image Processing
* Video Processing
* Audio Processing
* Text Cleaning

### Detection Module

Handles:

* AI-Generated Content Detection
* Manipulation Detection
* Deepfake Detection

### Multi-Modal Fusion Module

Combines outputs from different verification models.

### Explainability Module

Generates:

* Explanations
* Heatmaps
* Confidence Scores

### Result & Storage Module

Stores:

* Verification History
* Analysis Results
* User Activity

---

## Current Development Status

### Frontend

* [x] Project Structure
* [x] Landing Page
* [x] Authentication UI
* [x] Dashboard Design
* [x] Verification Module Layouts

### Upcoming

* [ ] AI Model Integration
* [ ] Explainability Engine
* [ ] Backend APIs
* [ ] Database Integration
* [ ] Cloud Deployment

---

## Repository Structure

```text
src/
│
├── pages/
│   ├── ImageVerification/
│   ├── VideoVerification/
│   ├── AudioVerification/
│   ├── TextVerification/
│   ├── Dashboard/
│   ├── History/
│   ├── Analytics/
│   ├── Profile/
│   └── Settings/
│
├── components/
├── assets/
├── layouts/
├── routes/
├── hooks/
└── services/
```

---

## Local Setup

```bash
git clone https://github.com/NamrahArfin/RealVeritas-AI.git

cd RealVeritas-AI

npm install

npm run dev
```

---

## Meet The Team

<table align="center">
<tr>

<td align="center">
<a href="https://github.com/NamrahArfin">
<img src="https://github.com/NamrahArfin.png" width="120px;" alt="Namrah Arfin"/>
<br />
<b>Namrah Arfin</b>
</a>
<br />
Project Lead
<br />
System Architect
<br />
Frontend & Integration
</td>

<td align="center">
<a href="https://github.com/Laxmi1902">
<img src="https://github.com/Laxmi1902.png" width="120px;" alt="Laxmi Yadav"/>
<br />
<b>Laxmi Yadav</b>
</a>
<br />
Image & Video Module
<br />
Developer
</td>

<td align="center">
<a href="https://github.com/RajNandini77">
<img src="https://github.com/RajNandini77.png" width="120px;" alt="Raj Nandini Dubey"/>
<br />
<b>Raj Nandini Dubey</b>
</a>
<br />
Audio & Text Module
<br />
Developer
</td>

</tr>
</table>

---

## Vision

Our goal is to build a trustworthy digital ecosystem where users can quickly verify whether content is authentic, manipulated, or AI-generated while understanding the reasoning behind every decision.

---

<p align="center">
  Made with ❤️ by Team RealVeritas AI
</p>
