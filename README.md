# Faint Aura - Development Experiment

A narrative-driven dungeon crawler with a twist. You play as a character slowly fading from existence — explore 7 interconnected rooms and 18 subrooms, fight turn-based battles with a dodge minigame, collect items, unlock doors, and uncover a story about manipulation and freedom.

---

## Gameplay Overview

- **Explore** rooms using directional choices (north, south, east, west)
- **Battle** enemies in turn-based combat — attack, defend, or use special items
- **Dodge** projectile patterns in a Canvas-based minigame between battle turns
- **Collect** keys and water items to unlock new paths and gain advantages
- **Survive** your fade — each room transition costs 2% fade; reach 0% and it's over
- **Save** your progress across 3 save slots, persisted per device

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Backend | Java 25, Spring Boot, Spring Data JPA |
| Database | PostgreSQL |
| Desktop | Electron 33 |
| Packaging | Electron Builder (Windows NSIS installer) |

The frontend is a rich client that handles all UI, dialogue, animations, and the dodge minigame. The backend is a stateless REST API for movement validation, enemy data, and save/load. Electron bundles the compiled JAR and a JRE for a zero-install Windows desktop experience.

---

## Project Structure

```
FADE/
├── frontend/       # React/TypeScript game client (Vite)
├── backend/        # Spring Boot REST API (Gradle)
└── electron/       # Desktop wrapper and packaging config
```

---

## Development Setup

### Prerequisites

- Node.js 18+
- Java 25+
- PostgreSQL (running locally)

### 1. Backend

```bash
cd backend
./gradlew bootRun
```

Runs on `a Render backend`. Requires a PostgreSQL database. Configure the connection in `backend/src/main/resources/application.properties` or via environment variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | JDBC connection URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`, proxying API calls to the backend.

### 3. Electron (Desktop)

```bash
cd electron
npm install
npm start
```

Launches the Electron window. It starts the Java backend automatically and loads the frontend.

---

## Production Build

### 1. Build the frontend

```bash
cd frontend
npm run build
```

Outputs compiled assets to `backend/src/main/resources/static/`, where Spring Boot serves them.

### 2. Build the backend JAR

```bash
cd backend
./gradlew build
```

JAR is created at `backend/build/libs/`.

### 3. Package the desktop app

Copy the JAR to `electron/resources/app.jar`, then:

```bash
cd electron
npm run dist
```

Produces a Windows NSIS installer in `electron/dist/`.

---

## Key Controls

| Key | Action |
|---|---|
| Arrow keys / Z | Navigate menus and confirm choices |
| C | Fast-forward dialogue text |
| X | Skip/reveal full dialogue instantly |
| ESC | Open save menu during gameplay |

---

## API Reference

The backend exposes a simple REST API:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/move` | Get next room given current room and direction |
| `GET` | `/api/enemy?EnemyID=X` | Fetch enemy stats for a room |
| `GET` | `/api/save/{slot}?deviceId=X` | Load a save slot |
| `POST` | `/api/save/{slot}?deviceId=X` | Write a save slot |
| `DELETE` | `/api/save/{slot}?deviceId=X` | Delete a save slot |

Saves are keyed by a device UUID stored in `localStorage` — no login required.

---

## Credits

Developed by Nandery.
