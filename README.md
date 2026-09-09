# 📱 QR Studio — QR Code Generator

A simple full-stack QR code generator that turns web links into clean, downloadable QR codes.  
The frontend is built with React + Vite, while the backend uses Java Spring Boot with SQLite for storing QR generation history.

## ⚙️ Features

- Accepts `http://` and `https://` links with friendly validation.
- Generates a scannable QR code in the browser.
- Download the current QR as a PNG or copy the link.
- Optional label, background color, size, and error-correction controls.
- Responsive layout with keyboard-friendly controls and reduced-motion support.

  
## 🛠️ Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Java 17+, Spring Boot, REST API
- **Database:** SQLite
- **Build Tools:** npm, Maven

## 📁 Project Structure

```text
qr-studio/
├── backend/
│   ├── data/
│   │   └── qr-studio.db
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## 🔌 API Reference

| Method   | Endpoint                | Purpose                   |
| -------- | ----------------------- | ------------------------- |
| `GET`    | `/api/generations`      | Get recent QR generations |
| `POST`   | `/api/generations`      | Save a QR generation      |
| `DELETE` | `/api/generations/{id}` | Delete a generation       |
| `DELETE` | `/api/generations`      | Clear all generations     |
| `GET`    | `/api/health`           | Check API status          |


## ⏩ Getting Started

### Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on: http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173


## 🚀 Deployment

 Deployed on vercel:  https://qrstudio-dev.vercel.app
