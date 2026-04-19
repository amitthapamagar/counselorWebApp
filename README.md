# School Counselor Directory

A Node.js + Express web application for managing high school counselors — list, search, create, edit, delete, and send bulk emails.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

npm start          # production
npm run dev        # development (auto-restart via nodemon)
```

Open **http://localhost:3000** in your browser.

---

## Project Structure

```
counselor-app/
├── server/
│   └── index.js              # Express entry point
├── routes/
│   ├── counselors.js         # CRUD REST routes
│   └── email.js              # Email send route
├── middleware/
│   └── validateCounselor.js  # Input validation
├── utils/
│   ├── dataStore.js          # JSON file data layer
│   └── mailer.js             # Nodemailer wrapper
├── data/
│   └── counselors.json       # Persistent data file
├── client/
│   └── public/
│       ├── index.html
│       ├── css/style.css
│       └── js/
│           ├── api.js        # fetch() wrapper
│           └── app.js        # UI logic
├── .env.example
├── .gitignore
└── package.json
```

---

## REST API

| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| GET    | `/api/counselors`         | List all (supports `?search=`)  |
| GET    | `/api/counselors/:id`     | Get one by id                   |
| POST   | `/api/counselors`         | Create (name + university req.) |
| PATCH  | `/api/counselors/:id`     | Partial update                  |
| DELETE | `/api/counselors/:id`     | Delete                          |
| POST   | `/api/email/send`         | Send bulk email                 |
| GET    | `/api/health`             | Health check                    |

### POST `/api/email/send` body

```json
{
  "to": ["email1@school.org", "email2@school.org"],
  "subject": "Important update",
  "text": "Hello counselors…",
  "html": "<p>Hello counselors…</p>"
}
```

---

## Environment Variables

| Variable              | Description                              |
|-----------------------|------------------------------------------|
| `PORT`                | Server port (default: 3000)              |
| `SMTP_HOST`           | SMTP server hostname                     |
| `SMTP_PORT`           | SMTP port (usually 587 or 465)           |
| `SMTP_SECURE`         | `true` for port 465, `false` otherwise   |
| `SMTP_USER`           | SMTP login username                      |
| `SMTP_PASS`           | SMTP login password / app password       |
| `EMAIL_FROM_NAME`     | Sender display name                      |
| `EMAIL_FROM_ADDRESS`  | Sender email address                     |

### Gmail setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an **App Password** at https://myaccount.google.com/apppasswords
3. Use that 16-character password as `SMTP_PASS`

---

## Swapping to a Real Database

All database logic lives in `utils/dataStore.js`. Replace the read/write JSON functions with your preferred adapter (MongoDB/Mongoose, PostgreSQL/pg, SQLite, etc.) — the route handlers need no changes.
