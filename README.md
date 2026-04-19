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


```json
{
  "to": ["email1@school.org", "email2@school.org"],
  "subject": "Important update",
  "text": "Hello counselors…",
  "html": "<p>Hello counselors…</p>"
}
```




