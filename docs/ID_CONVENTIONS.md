ID conventions used in this project

- Admin users: IDs begin with `admin-` (e.g., `admin-1673612345678`).
  - Managed via `services/adminDatabase.ts::addAdmin` which enforces the prefix when creating admins.
- Customer users: IDs begin with `cust-` (e.g., `cust-1673612345678`).
  - Managed via `services/database.ts::addUser` which enforces the prefix when creating customers.
- Other system users or legacy IDs may use `u-` prefixes but the code prefers `admin-` and `cust-` for clarity.

Why this matters
- Makes it easy to identify user types when browsing the `users` table.
- Simplifies queries and reporting (e.g., SELECT ... WHERE id LIKE 'cust-%').

Notes
- All user accounts (admins and customers) are stored in the same `users` table; role is recorded in the `role` column.
- For production, consider a server-side user model with proper role-based access control and hashed passwords (see `docs/PRODUCTION.md`).