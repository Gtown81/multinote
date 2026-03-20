# Atelier Notes (Web + Android + iOS)

Diese Version ist als **voll funktionsfähige Basis** umgesetzt mit:
- Browser-App (React + Vite)
- Mobile Packaging (Capacitor für Android/iOS)
- Backend API (Node.js + Express)
- MongoDB Atlas als zentrale Online-Datenbank

## Features
- Registrierung/Login mit JWT
- Notizen: erstellen, bearbeiten, löschen, `shared`-Status
- Tasks: erstellen, abhaken, löschen
- Persistente Daten über MongoDB Atlas

## 1) MongoDB Atlas einrichten
1. Atlas Cluster erstellen
2. Datenbank-User anlegen
3. IP Access List konfigurieren (für Entwicklung z. B. `0.0.0.0/0`)
4. Connection String in `server/.env` eintragen (aus `.env.example` kopieren)

## 2) Backend starten
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
API läuft dann auf `http://localhost:4000`.

## 3) Frontend starten (Browser)
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
App läuft dann auf `http://localhost:5173`.

## 4) Android/iOS Build mit Capacitor
```bash
cd client
npm run sync:mobile
npx cap add android
npx cap add ios
npm run android
npm run ios
```

### APK erzeugen (Android)
1. `npm run android` (öffnet Android Studio)
2. In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Signiertes Release: **Build > Generate Signed Bundle / APK**

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/notes`
- `GET/POST/PUT/DELETE /api/tasks`

## Nächste sinnvolle Erweiterungen
- Ende-zu-Ende Verschlüsselung für Notiz-Inhalte
- Team-Freigaben mit Rollen/Rechten
- Push Notifications
- Dateianhänge
- Offline Sync
