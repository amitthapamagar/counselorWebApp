# School Counselor Directory

A Node.js + Express web application for managing high school counselors — list, search, create, edit, delete, and send bulk emails.

---

## Prerequisites — install these first

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org (choose LTS) |
| npm | comes bundled with Node.js | — |

After installing, **close and reopen your terminal**, then verify:
```bash
node -v   # should print v18.x.x or higher
npm -v    # should print 9.x.x or higher
```

If you use **nvm** (Node Version Manager):
```bash
nvm install 20
nvm use 20
```

---

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd counselor-app-clean

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Open .env and fill in your SMTP credentials

# 4. Start the server
npm run dev     # development (auto-restart)
npm start       # production
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
├── .nvmrc                    # Node version hint for nvm users
├── .env.example
├── .gitignore
└── package.json
```

---

## REST API

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/api/counselors`     | List all (supports `?search=`) |
| GET    | `/api/counselors/:id` | Get one by id                  |
| POST   | `/api/counselors`     | Create (name + university req.)|
| PATCH  | `/api/counselors/:id` | Partial update                 |
| DELETE | `/api/counselors/:id` | Delete                         |
| POST   | `/api/email/send`     | Send bulk email                |
| GET    | `/api/health`         | Health check                   |

---

## Environment Variables

| Variable             | Description                            |
|----------------------|----------------------------------------|
| `PORT`               | Server port (default: 3000)            |
| `SMTP_HOST`          | SMTP server hostname                   |
| `SMTP_PORT`          | SMTP port (usually 587 or 465)         |
| `SMTP_SECURE`        | `true` for port 465, `false` otherwise |
| `SMTP_USER`          | SMTP login username                    |
| `SMTP_PASS`          | SMTP password / app password           |
| `EMAIL_FROM_NAME`    | Sender display name                    |
| `EMAIL_FROM_ADDRESS` | Sender email address                   |

### Gmail setup
1. Enable 2-Factor Authentication on your Google account
2. Generate an **App Password** at https://myaccount.google.com/apppasswords
3. Use that 16-character password as `SMTP_PASS`

---

## Troubleshooting

**`npm: command not found`**
- Make sure you installed Node.js from https://nodejs.org
- Close and reopen your terminal after installing
- If using nvm: run `nvm use 20` before `npm install`
- On Windows: ensure `C:\Program Files\nodejs\` is in your system PATH

**`Error: Cannot find module '...'`**
- Run `npm install` — dependencies are not committed to the repo

**Port already in use**
- Change `PORT=3001` in your `.env` file
