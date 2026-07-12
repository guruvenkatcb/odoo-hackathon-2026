# TransitOps — Smart Transport Operations Platform

Full working implementation of the Odoo Hackathon 2026 "TransitOps" problem
statement — all 9 mandatory deliverables, tested end-to-end.

## What's built (mandatory deliverables)

| Requirement | Status |
|---|---|
| Responsive web interface | ✅ Tailwind, works on mobile/desktop |
| Authentication with RBAC | ✅ Token auth + role field (Fleet Manager / Driver / Safety Officer / Financial Analyst) |
| CRUD for Vehicles and Drivers | ✅ Full create/read/update, with validation |
| Trip Management with validations | ✅ Cargo ≤ capacity, availability checks, expired-license checks |
| Automatic status transitions | ✅ Dispatch/Complete/Cancel auto-update vehicle & driver status |
| Maintenance workflow | ✅ Creating a record → vehicle "In Shop"; closing → back to "Available" |
| Fuel & Expense tracking | ✅ Fuel logs (auto-created on trip completion) + expense model |
| Dashboard with KPIs | ✅ Active/Available vehicles, in-maintenance, active/pending trips, drivers on duty, fleet utilization % |
| Charts and visual analytics | ✅ Reports table: fuel efficiency, operational cost, ROI per vehicle |
| CSV export | ✅ `/api/reports/?format=csv` |

**Not built** (explicitly listed as bonus in the spec, skip unless you finish early):
PDF export, dark mode, email reminders, document management.

## Business rules — all tested and verified working

- Vehicle registration number is unique
- Retired / In Shop vehicles never appear in the dispatch pool
- Drivers with expired licenses or Suspended status can't be assigned
- A vehicle/driver already On Trip can't be assigned to another trip
- Cargo weight can't exceed the vehicle's max load capacity
- Dispatch → vehicle + driver become "On Trip"
- Complete → vehicle + driver become "Available" again, odometer updates, fuel log created
- Cancel (on a Dispatched trip) → restores vehicle + driver to "Available"
- Creating an open maintenance record → vehicle becomes "In Shop"
- Closing maintenance → vehicle back to "Available" (unless Retired)

## How to run it (GitHub Codespaces)

1. Push this to your repo (**single branch only**, per the hackathon rules).
2. **Code → Codespaces → Create codespace on main.**
3. Wait ~1–2 min for auto-setup (installs Python, Node, all dependencies, runs migrations).
4. **Terminal 1 — backend:**
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```
5. **Terminal 2 — frontend:**
   ```bash
   cd frontend
   npm run dev -- --host
   ```
6. In the **Ports** tab: set port 8000 to **Public**, copy its forwarded URL.
7. Create `frontend/.env` with:
   ```
   VITE_API_URL=https://<your-forwarded-8000-url>/api
   ```
8. Restart the frontend (Ctrl+C, then `npm run dev -- --host` again), open the port 5173 preview.

## API reference

| Endpoint | Method | Notes |
|---|---|---|
| `/api/auth/register/` | POST | `{username, email, password, role}` |
| `/api/auth/login/` | POST | `{username, password}` → `{token, role}` |
| `/api/vehicles/` | GET/POST | `?status=Available`, `?dispatch_pool=true` to filter |
| `/api/vehicles/<id>/` | GET/PATCH | |
| `/api/drivers/` | GET/POST | same filters as vehicles |
| `/api/trips/` | GET/POST | create validates cargo weight + availability |
| `/api/trips/<id>/dispatch_trip/` | POST | Draft → Dispatched |
| `/api/trips/<id>/complete_trip/` | POST | `{end_odometer, fuel_consumed, fuel_cost}` |
| `/api/trips/<id>/cancel_trip/` | POST | Dispatched → Cancelled |
| `/api/maintenance/` | GET/POST | creating auto-sets vehicle to In Shop |
| `/api/maintenance/<id>/close/` | POST | restores vehicle to Available |
| `/api/fuel-logs/`, `/api/expenses/` | GET/POST | |
| `/api/dashboard/` | GET | KPI numbers |
| `/api/reports/` | GET | add `?format=csv` for file download |

## Demo script (matches the spec's example workflow)

1. Register as Fleet Manager, log in
2. Register vehicle `Van-05`, capacity 500kg
3. Add driver `Alex` with a valid (non-expired) license
4. Create a trip: cargo 450kg → succeeds. Try 600kg → correctly rejected.
5. Dispatch the trip → vehicle & driver both flip to "On Trip"
6. Complete the trip with odometer + fuel → both flip back to "Available"
7. Create a maintenance record for the vehicle → status becomes "In Shop",
   disappears from the dispatch dropdown on the Trips page
8. Close the maintenance record → vehicle available again
9. Check Dashboard for updated KPIs, Reports for fuel efficiency/cost/ROI

## Team checklist before demo/submission

- [ ] All 4 members can open this in Codespaces and get both servers running
- [ ] Mentor's GitHub ID added as collaborator once assigned
- [ ] Everyone joined the Discord group
- [ ] Single branch only — no feature branches on the submitted repo
- [ ] Do one full click-through of the demo script above before presenting
