Production deployment recommendations

This project currently uses in-browser SQLite (sql.js) with IndexedDB persistence for demo/admin convenience. For production and multi-device support you should migrate to a server-side architecture.

Suggested migration plan

1) Choose a server DB
   - PostgreSQL or MySQL are recommended for relational data.
   - Use managed services (AWS RDS, Google Cloud SQL, Azure Database) if possible.

2) Move sensitive logic to backend
   - Implement a REST or GraphQL API that exposes only authenticated endpoints.
   - Implement server-side input validation and rate-limiting.

3) Secure authentication
   - Use bcrypt/argon2 to hash passwords before storing them.
   - Issue short-lived JWTs or use session cookies with CSRF protection.
   - Never store plaintext passwords or card data in the DB.

4) Data migration
   - Export current SQLite DB (Admin → Export) and convert to SQL or use ETL scripts to import into the server DB.
   - Add schema migrations (e.g., using Knex, Sequelize, TypeORM, Flyway, or Liquibase).

5) Admin and backups
   - Move admin credentials and images to a secure storage (e.g., S3 for images with signed URLs).
   - Schedule server-side backups and create retention policies.

6) PCI / PII considerations
   - Do not store card PANs or other payment information unless you have PCI compliance in place.
   - Consider using a payment provider (Stripe/PayPal/Razorpay) and store only tokens/references.

7) Deployment & monitoring
   - Add logging, monitoring, and alerts (Sentry, Datadog, Prometheus, etc.).
   - Add automated tests and CI pipelines.

If you'd like, I can scaffold a minimal Node.js backend with an Express + SQLite/Postgres setup and implement secure signup/login endpoints (with hashed passwords) so your web app can switch to server-based authentication and central storage. Let me know which DB you'd prefer and whether to implement JWT or cookie-based sessions.