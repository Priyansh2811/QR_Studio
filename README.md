# QR Studio

QR Studio turns any web link into a clean, downloadable QR code. It has a small React frontend and a Java/Spring Boot API backed by SQLite, so saved links stay on your machine while you build a useful personal history.

## Features

- Accepts `http://` and `https://` links with friendly validation.
- Generates a scannable QR code in the browser.
- Download the current QR as a PNG or copy the link.
- Optional label, foreground/background color, size, and error-correction controls.
- Saves generations to SQLite through the Java API.
- Recent history with one-click delete and clear-all actions.
- Responsive layout with keyboard-friendly controls and reduced-motion support.

## Requirements

- Node.js 18+ and npm
- Java 17+
- Maven 3.9+ (or use the Maven wrapper if you add one)

## Run locally

Open two terminals from `qr-studio`.

### 1. Start the Java API

```bash
cd backend
mvn spring-boot:run
```

The API listens on `http://localhost:8080`. SQLite is created at `backend/data/qr-studio.db` on first start. Set `QR_DB_PATH` if you want another location.

### 2. Start the React app

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The frontend uses `VITE_API_URL` when present; otherwise it calls `http://localhost:8080/api`.

### Production builds

```bash
cd frontend && npm run build
cd ../backend && mvn test
```

The frontend build is written to `frontend/dist`. The Java API can be packaged with `mvn package` and run with `java -jar target/qr-studio-api-1.0.0.jar`.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/generations` | Return recent saved links |
| `POST` | `/api/generations` | Validate and save `{ "url": "...", "label": "..." }` |
| `DELETE` | `/api/generations/{id}` | Delete one saved link |
| `DELETE` | `/api/generations` | Clear all saved links |
| `GET` | `/api/health` | Basic health response |



