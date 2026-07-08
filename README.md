# Askly – Vue 3 Frontend + Laravel 12 Backend

Live-Q&A für Vorlesungen und Meetings. Vorher: reines Vue-Frontend auf Firebase.
Jetzt (Termin 3): **eigenes Laravel-REST-Backend + SQLite + Sanctum** – kein Firebase mehr.

- **Frontend**: `askly-frontend/` (Vue 3, Pinia, Tailwind, Vite)
- **Backend**:  `askly-backend/`  (Laravel 12, Sanctum, SQLite)
- Kommunikation: **REST/JSON** (Frontend → `http://localhost:8000/api`)

---

## Quickstart (frisch geklont)

Voraussetzungen: PHP ≥ 8.2, Composer, Node ≥ 20.

### 1) Backend starten (Terminal 1)

```bash
cd askly-backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve            # → http://localhost:8000
```

Smoke-Test:

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Dozent","email":"dozent@hs.de","password":"geheim1"}'
```

### 2) Frontend starten (Terminal 2)

```bash
cd askly-frontend
cp .env.example .env         # enthält VITE_API_URL=http://localhost:8000/api
npm install
npm run dev                  # → http://localhost:5173
```

Fertig – Frontend spricht REST mit dem Backend.

---

## REST-API auf einen Blick

| Methode | Pfad | Auth | Zweck |
|--------|------|------|-------|
| POST | `/api/register` | – | Host-Account anlegen, Token zurück |
| POST | `/api/login` | – | Login, Token zurück |
| POST | `/api/logout` | Token | Token löschen |
| GET  | `/api/user` | Token | eingeloggten Host abrufen |
| GET  | `/api/sessions` | Token | eigene Sessions (Host-Historie) |
| POST | `/api/sessions` | Token | neue Session erstellen |
| GET  | `/api/sessions/{code}` | – | Session + Fragen laden (Polling) |
| POST | `/api/sessions/{code}/join` | – | als Gast beitreten |
| PATCH| `/api/sessions/{code}/end` | Token | Session beenden (nur Besitzer) |
| POST | `/api/sessions/{code}/questions` | – | Frage stellen |
| POST | `/api/questions/{id}/vote` | – | Frage hochvoten (1× pro Browser) |

Details: [`askly-backend/SETUP.md`](askly-backend/SETUP.md).

---

## Architektur

```
Vue 3 (Browser, Port 5173)
   │  REST/JSON
   ▼
Laravel 12 API (Port 8000)
   │  Eloquent ORM
   ▼
SQLite (database/database.sqlite)
```

Datenmodell: `users`, `sessions`, `questions`, `question_votes`
(+ `personal_access_tokens` für Sanctum). UNIQUE-Constraint verhindert
Mehrfach-Votes pro Browser.
