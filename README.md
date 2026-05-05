# ⚖️ AI Lawyer Assistant

An AI system that automates a lawyer's daily email workflow.

---

## 🎯 Project Objective

A lawyer talks with clients daily via **Gmail email**. This project does three things:

| # | Task | How |
|---|------|-----|
| 1 | **Store Email Conversations in DB** | All lawyer and client emails are saved in MongoDB |
| 2 | **AI Update Every 12 Hours** | AI reads conversations from DB and emails the lawyer a summary of what each client said |
| 3 | **Legal Chatbot** | The lawyer asks legal questions; AI answers based on Bangladesh law |

---

## 🏗️ System Architecture

```
Gmail (Client Emails)
        │
        │  IMAP (every 12 hrs)
        ▼
┌───────────────────┐
│   MongoDB (DB)    │  ◄── Outgoing lawyer emails are also saved
│                   │
│  Conversations    │
│  Messages         │
│  AISummaries      │
└───────────────────┘
        │
        │  AI reads DB
        ▼
┌───────────────────┐
│   OpenAI GPT      │
│  (gpt-4o-mini)    │
└───────────────────┘
        │
        │  Summary Email
        ▼
   Lawyer's Gmail
   (12-hour update)


Lawyer
  │
  │  HTTP POST /api/chat/ask
  ▼
┌───────────────────┐
│  Legal Chatbot    │  ◄── Bangladesh Law AI
└───────────────────┘
```

---

## 📁 Project Structure

```
ai-lawyer-assistant/
└── server/
    ├── .env                        # Environment variables (secrets)
    ├── server.js                   # Entry point
    ├── app.js                      # Express app, routes setup
    │
    ├── config/
    │   └── db.js                   # MongoDB connection
    │
    ├── models/
    │   ├── Conversation.js         # Client-Lawyer conversation thread
    │   ├── Message.js              # Individual email messages
    │   ├── AISummary.js            # AI-generated update reports
    │   └── User.js                 # User info (optional)
    │
    ├── services/
    │   ├── emailService.js         # Gmail IMAP sync + SMTP send
    │   ├── openaiService.js        # AI summary + Legal chatbot
    │   └── notificationService.js  # Send update email to lawyer
    │
    ├── jobs/
    │   └── aiSummaryJob.js         # 12-hour cron job (core automation)
    │
    ├── controllers/
    │   ├── chatController.js       # Legal chatbot endpoint
    │   ├── emailController.js      # Email send/sync endpoints
    │   ├── conversationController.js # Conversation CRUD
    │   └── summaryController.js    # AI summaries endpoints
    │
    └── routes/
        ├── chatRoutes.js
        ├── emailRoutes.js
        ├── conversationRoutes.js
        └── summaryRoutes.js
```

---

## ⚙️ Setup

### Step 1 - Prerequisites

Make sure the following are installed:

- **Node.js** -> https://nodejs.org (v18+)
- **MongoDB** -> https://www.mongodb.com/try/download/community
- **Gmail account** with 2-Factor Authentication enabled

---

### Step 2 - Create a Gmail App Password

> ⚠️ Do not put your real Gmail password in `.env`. Use an App Password.

1. Go to -> https://myaccount.google.com/apppasswords
2. Set **App name**: `AI Lawyer Assistant`
3. Click **Create**
4. Google will provide a **16-digit password** (example: `abcd efgh ijkl mnop`)
5. Put it into `.env` (without spaces)

---

### Step 3 - Configure `.env`

Open `server/.env` and set all values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lawyerAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx

# Lawyer Information
LAWYER_EMAIL=lawyer@gmail.com
LAWYER_NAME=Ruhul (Advocate)

# Gmail IMAP - read incoming client emails
GMAIL_USER=ruhul.cse.duet@gmail.com
GMAIL_APP_PASSWORD=

# Gmail SMTP - send emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=lawyer.ai@gmail.com
SMTP_PASS=
```

> Get your **OpenAI API Key** -> https://platform.openai.com/api-keys

---

### Step 4 - Install and Run

```cmd
cd C:\Users\ruhul\Desktop\project\ai-lawyer-assistant\server

npm install

npm run dev
```

If successful, you will see:
```
✅ MongoDB Connected: localhost
✅ AI Update Job scheduled — runs at 8:00 AM & 8:00 PM (Dhaka time)
✅ Server running on port 5000
📧 Lawyer: lawyer@gmail.com
```

---

## 🔄 How the 12-Hour Job Works

The job runs **every day at 8:00 AM and 8:00 PM** (Dhaka time).

```
Job starts
   │
   ├─ Step 1: Check Gmail INBOX
   │          New unread client emails -> save to MongoDB
   │
   ├─ Step 2: Read the last 12 hours of
   │          incoming (client) messages from DB
   │
   ├─ Step 3: Group messages by client
   │
   ├─ Step 4: Send to OpenAI GPT
   │          -> AI creates a professional update report
   │          -> "Client X said..., Client Y asked..., Follow-up needed..."
   │
   ├─ Step 5: Save report to MongoDB (AISummary collection)
   │
   └─ Step 6: Send a styled HTML email to the lawyer's Gmail
              -> Subject: "⚖️ Email Update: 5 client message(s) in last 12 hours"
```

---

## 💬 How the Legal Chatbot Works

When the lawyer sends a question to `/api/chat/ask`:

```
Lawyer -> "What can I do if a contract is breached?"
              │
              ▼
         OpenAI GPT
    (Bangladesh Law expert)
              │
              ▼
   "According to Section 73 of the Bangladesh Contract Act 1872..."
              │
              ▼
         Lawyer receives the answer
```

- If you pass **chatHistory**, the AI keeps conversation context
- The assistant is trained for major Bangladesh laws

---

## 📡 API Endpoints

### 🤖 Legal Chatbot

#### `POST /api/chat/ask`
The lawyer asks a legal question.

**Request:**
```json
{
  "question": "What legal steps can I take for a contract breach under Bangladesh law?",
  "chatHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "question": "What legal steps can I take for a contract breach under Bangladesh law?",
  "answer": "According to Section 73 of the Bangladesh Contract Act 1872...",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Multi-turn conversation (using chatHistory):**
```json
{
  "question": "How long do I have to file a case in this scenario?",
  "chatHistory": [
    { "role": "user", "content": "What can I do if a contract is breached?" },
    { "role": "assistant", "content": "According to the Bangladesh Contract Act 1872..." }
  ]
}
```

---

### 📧 Email Management

#### `POST /api/emails/sync`
Manually sync new client emails from Gmail.

**Response:**
```json
{
  "success": true,
  "synced": 3,
  "message": "3 new client email(s) synced from Gmail and saved to DB."
}
```

#### `POST /api/emails/send`
Send an email to a client (sent via Gmail + saved to DB).

**Request:**
```json
{
  "to": "client@gmail.com",
  "subject": "Your Case Update - Hearing Date",
  "body": "Dear Client,\n\nYour case hearing is scheduled for Monday, January 20th at 10:00 AM.",
  "conversationId": "65a1b2c3d4e5f6789"
}
```

#### `GET /api/emails/messages/:conversationId`
Get all messages for a conversation (timeline order).

---

### 🗂️ Conversations

#### `GET /api/conversations`
List all client conversations.

Query params: `?status=active&page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "total": 15,
  "conversations": [
    {
      "_id": "65a1b2c3...",
      "subject": "Contract Dispute Help",
      "clientEmail": "client@gmail.com",
      "clientName": "Rahim Uddin",
      "status": "active",
      "messageCount": 8,
      "lastMessageAt": "2025-01-15T09:00:00Z"
    }
  ]
}
```

#### `GET /api/conversations/:id`
Get a conversation with all details and messages.

#### `PATCH /api/conversations/:id/status`
Update conversation status.

**Request:**
```json
{ "status": "closed" }
```
Status options: `active` | `pending` | `closed`

---

### 📊 AI Summaries

#### `GET /api/summaries/latest`
Get the latest AI-generated update report.

#### `GET /api/summaries`
Get past summaries (latest 30).

#### `POST /api/summaries/trigger`
Trigger the AI update job now (no need to wait 12 hours).

**Response:**
```json
{
  "success": true,
  "message": "AI update job triggered! Check server logs and your email inbox."
}
```

---

## 🧪 Postman Tests

### Test 1 - Server status
```
GET http://localhost:5000/
```

### Test 2 - Chatbot test
```
POST http://localhost:5000/api/chat/ask
Content-Type: application/json

{
  "question": "How do I draft a land sale agreement?",
  "chatHistory": []
}
```

### Test 3 - Gmail sync (fetch client emails)
```
POST http://localhost:5000/api/emails/sync
```

### Test 4 - Send an email to a client
```
POST http://localhost:5000/api/emails/send
Content-Type: application/json

{
  "to": "client@gmail.com",
  "subject": "Case Update",
  "body": "Dear Client, please bring all documents on Monday."
}
```

### Test 5 - Trigger AI update job now
```
POST http://localhost:5000/api/summaries/trigger
```
-> You will receive an AI update email in a few seconds.

### Test 6 - List all conversations
```
GET http://localhost:5000/api/conversations
```

---

## 🛠️ Troubleshooting

| Problem | Cause | Fix |
|--------|-------|-----|
| `MongoDB connection failed` | MongoDB service is stopped | In CMD: `net start MongoDB` |
| `IMAP Error: Invalid credentials` | App Password is wrong | Google Account -> App Passwords -> generate a new one |
| `OpenAI error: 401` | API Key is invalid | Get a new key from platform.openai.com |
| `OpenAI error: 429` | Quota exhausted | Add credit to your OpenAI account |
| `Cannot find module` | Packages not installed | Run `npm install` again |
| Gmail sync not working | IMAP disabled | Gmail Settings -> See all settings -> Forwarding and POP/IMAP -> enable IMAP |

---

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | Backend server |
| **MongoDB + Mongoose** | Database - store conversations and messages |
| **node-cron** | 12-hour automated job scheduling |
| **imap + mailparser** | Read emails from Gmail |
| **nodemailer** | Send emails |
| **OpenAI GPT-4o-mini** | AI summary generation and legal chatbot |
| **dotenv** | Environment variables |

---

## 🔐 Security Notes

- Never push `.env` to GitHub - keep it in `.gitignore`
- Do not use your real Gmail password - always use an **App Password**
- Keep your OpenAI API key private - do not share publicly

---

## 📄 License

MIT License - Personal use only.
