# Atelier Notes (Web + Android + iOS)

## Umgesetzte Features
- Auth mit JWT
- E2E-verschlüsselte Notes (Client-seitig AES-GCM)
- Notes mit zusätzlichem **unverschlüsselten Feld `publicInfo`** (immer lesbar)
- Workspace mit Tabs: **Notes / Tasks / Todos**
- Globaler **+ Button** zum Erstellen von Note/Task/Todo inkl. Team-Zuweisung
- Eigene Seiten im Header: **Workspace**, **Teams**, **Profil**
- Teamverwaltung auf eigener Seite inkl. Rollen (Owner/Editor/Viewer)
- Team-Sicherheitsdaten: Owner kann verschlüsseltes Team-Passwort + member encrypted keys speichern
- Dateianhänge bei Notes
- Offline Queue Sync
- Push Subscription Speicherung

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/notes`
- `POST /api/notes/:id/attachments`
- `DELETE /api/notes/:id/attachments/:attachmentId`
- `GET/POST/PUT/DELETE /api/tasks`
- `GET/POST/PUT/DELETE /api/todos`
- `GET/POST /api/teams`
- `POST /api/teams/:id/members`
- `PATCH /api/teams/:id/members/:memberId`
- `POST /api/teams/:id/security`
- `POST /api/push/subscribe`
- `GET /api/push/subscriptions`

## Start
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Mobile / APK
```bash
cd client
npm run sync:mobile
npx cap add android
npx cap add ios
npm run android
npm run ios
```
