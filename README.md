# Atelier Notes (Web + Android + iOS)

Diese Version ist als **voll funktionsfähige Basis** umgesetzt mit:
- Browser-App (React + Vite)
- Mobile Packaging (Capacitor für Android/iOS)
- Backend API (Node.js + Express)
- MongoDB Atlas als zentrale Online-Datenbank

## Umgesetzte Kernfeatures
- Registrierung/Login mit JWT
- **Ende-zu-Ende Verschlüsselung für Notiz-Inhalte** (AES-256-GCM im Client)
- **Team-Freigaben mit Rollen/Rechten** (Owner/Editor/Viewer)
- **Push-Notification-Registrierung** (Web Push Subscription gespeichert)
- **Dateianhänge** pro Notiz (Base64-Upload, max 5 MB je Datei)
- **Offline Sync** (Operationen werden offline in Queue gespeichert und bei Online-Status synchronisiert)

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
- `POST /api/notes/:id/attachments`
- `DELETE /api/notes/:id/attachments/:attachmentId`
- `GET/POST/PUT/DELETE /api/tasks`
- `GET/POST /api/teams`
- `POST /api/teams/:id/members`
- `PATCH /api/teams/:id/members/:memberId`
- `POST /api/push/subscribe`
- `GET /api/push/subscriptions`

## Hinweise zur E2E-Verschlüsselung
- Klartext wird nur im Client ver-/entschlüsselt.
- Der Server speichert nur Ciphertext + IV + Salt.
- Das E2E-Passwort wird **nicht** an den Server gesendet.

## Hinweise zu Push
- Für echte Browser Push-Zustellung bitte VAPID Keys integrieren (`VITE_VAPID_PUBLIC_KEY`) und einen Push-Sender (z. B. `web-push` im Backend) ergänzen.
