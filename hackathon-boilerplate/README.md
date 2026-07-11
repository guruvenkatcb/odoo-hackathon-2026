# Odoo Hackathon 2026 — Team Boilerplate

Django + React starter, pre-wired for GitHub Codespaces. Everyone on the team opens
the same environment in the browser — no local installs needed.

## What's already built

**Backend (Django + DRF)** — `backend/`
- User registration & token login (`/api/auth/register/`, `/api/auth/login/`, `/api/auth/me/`)
- Full CRUD REST API for a sample `Item` model (`/api/items/`)
- Backend input validation example (see `api/serializers.py`)
- CORS open for local dev
- SQLite (zero setup) — swap for Postgres later if needed

**Frontend (React + Vite + Tailwind)** — `frontend/`
- Routing set up (`react-router-dom`)
- Auth context (login/register/logout, token stored in localStorage)
- Reusable components: `Button`, `Input`, `Modal`, `Navbar`
- A working page (`Home.jsx`) showing the full CRUD loop end-to-end (list, create, delete)
- Frontend validation example on the Register form

This gives your team a working full-stack app **before you even see the problem
statement**. On hackathon day, you adapt the `Item` model / `Home` page into
whatever the problem statement actually needs — you're not starting from zero.

## How to run it (in GitHub Codespaces)

1. Push this repo to GitHub (this should be the **same repo** your team leader
   submits via "Submit GitHub Repo Link" — keep everything on a **single branch**,
   per the hackathon rules).
2. On GitHub, click **Code → Codespaces → Create codespace on main**.
3. Wait ~1-2 minutes — the `.devcontainer` config auto-installs everything
   (Python, Node, all dependencies, runs migrations).
4. Open two terminals in the Codespace:

   **Terminal 1 — backend:**
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

   **Terminal 2 — frontend:**
   ```bash
   cd frontend
   npm run dev -- --host
   ```
5. Codespaces will prompt to open a forwarded port for 5173 (frontend) — click
   it or check the "Ports" tab in VS Code.
6. If the frontend can't reach the backend, copy `frontend/.env.example` to
   `frontend/.env` and set `VITE_API_URL` to your forwarded port-8000 URL
   (shown in the Ports tab), e.g. `https://<codespace-name>-8000.app.github.dev/api`.

## How to run it locally instead (optional)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Adapting this for your actual problem statement

1. **Rename the model.** In `backend/api/models.py`, `Item` → whatever your
   problem needs (e.g. `Task`, `Booking`, `Ticket`). Add/remove fields.
2. **Update the serializer** (`backend/api/serializers.py`) to match your new
   fields, keeping the validation pattern.
3. **Update the views/urls** if you need more than basic CRUD (custom actions,
   filtering, etc. — DRF's `ModelViewSet` supports this easily, just ask Claude).
4. **Update `Home.jsx`** on the frontend to match your new fields and whatever
   UI the problem actually calls for.
5. Run `python manage.py makemigrations && python manage.py migrate` after any
   model changes.

## Hackathon rules this boilerplate already respects

- ✅ Real backend + frontend validation (not just static JSON)
- ✅ Clean, consistent Tailwind-based UI
- ✅ Everyone can commit under their own name (multi-member repo)
- ✅ Single branch — don't create feature branches for your final submission
- ✅ Dynamic data via a real database + API (not hardcoded JSON)

## Team checklist before July 12

- [ ] All 4 members can open this repo in Codespaces and get both servers running
- [ ] Repo has the mentor's GitHub ID added as a collaborator once assigned
- [ ] Everyone has joined the Discord group
- [ ] Do one practice run: rename `Item` to something else end-to-end, so the
      adaptation step feels familiar on the actual day
