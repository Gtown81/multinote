# Atelier Notes (Web + Android + iOS)

## Was jetzt funktioniert
- Seiten im Header: **Workspace**, **Teams**, **Profil**
- Oben im Header: E2E Passwort-Feld + Checkbox „Im Browser speichern“ für automatisches Entschlüsseln
- Workspace mit Tabs: **Notes / Tasks / Todos**
- Globaler **+ Button** für neue Note/Task/Todo (mit Team-Zuweisung)
- Notes haben:
  - verschlüsselten Inhalt (E2E)
  - zusätzliches unverschlüsseltes Feld `publicInfo` (immer sichtbar)
- Notes/Tasks/Todos können geöffnet und bearbeitet werden
- Teams können geöffnet und bearbeitet werden
- Owner kann Gruppenpasswort setzen und beim Einladen teilen (verschlüsselt gespeichert)

## Gruppenpasswort (ohne Blob-Verwirrung)
### Team erstellen mit Gruppenpasswort
1. In **Teams** gehen.
2. `Neues Team` eintragen.
3. Optional `Gruppenpasswort` eintragen.
4. `Team erstellen` klicken.

Wenn ein Gruppenpasswort gesetzt ist, wird es clientseitig verschlüsselt und als Team-Sicherheitsdaten gespeichert.

### Mitglied einladen + Gruppenpasswort teilen
1. Team öffnen.
2. E-Mail + Rolle eintragen.
3. Gruppenpasswort im Feld lassen/eintragen.
4. `Einladen` klicken.

Die App erzeugt dabei automatisch einen verschlüsselten Schlüssel-Eintrag für das Mitglied.

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/notes`
- `POST /api/notes/:id/attachments`
- `DELETE /api/notes/:id/attachments/:attachmentId`
- `GET/POST/PUT/DELETE /api/tasks`
- `GET/POST/PUT/DELETE /api/todos`
- `GET/POST/PUT /api/teams`
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
