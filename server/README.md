# ⚖️ AI Lawyer Assistant

একজন Lawyer-এর daily email workflow কে AI দিয়ে automate করার সিস্টেম।

---

## 🎯 Project এর উদ্দেশ্য

একজন Lawyer প্রতিদিন তার clients-দের সাথে **Gmail-এ email করে** কথা বলেন।  
এই project টি তিনটি কাজ করে:

| # | কাজ | কীভাবে |
|---|-----|---------|
| 1 | **Email Conversations DB তে Store** | Lawyer ও Client-এর সব email MongoDB-তে save হয় |
| 2 | **12 ঘন্টা পরপর AI Update** | AI, DB থেকে conversations পড়ে Lawyer-কে email করে — "আজকে কোন client কী বলেছে" |
| 3 | **Legal Chatbot** | Lawyer যেকোনো আইনি প্রশ্ন করলে AI Bangladesh law অনুযায়ী উত্তর দেয় |

---

## 🏗️ System Architecture

```
Gmail (Client Emails)
        │
        │  IMAP (every 12 hrs)
        ▼
┌───────────────────┐
│   MongoDB (DB)    │  ◄── Lawyer-এর outgoing emails-ও save হয়
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
    │   └── notificationService.js  # Lawyer কে update email পাঠানো
    │
    ├── jobs/
    │   └── aiSummaryJob.js         # 12-hour cron job (মূল automation)
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

## ⚙️ Setup করো

### Step 1 — Prerequisites

নিচেরগুলো installed থাকতে হবে:

- **Node.js** → https://nodejs.org (v18+)
- **MongoDB** → https://www.mongodb.com/try/download/community
- **Gmail Account** with 2-Factor Authentication enabled

---

### Step 2 — Gmail App Password তৈরি করো

> ⚠️ `.env`-এ তোমার Gmail-এর আসল password **দেবে না**। একটি special App Password লাগবে।

1. যাও → https://myaccount.google.com/apppasswords
2. **App name** দাও: `AI Lawyer Assistant`
3. **Create** করো
4. Google একটি **16-digit password** দেবে (যেমন: `abcd efgh ijkl mnop`)
5. সেটা `.env`-এ দাও (spaces ছাড়া)

---

### Step 3 — `.env` File Configure করো

`server/.env` file খোলো এবং সব value দাও:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lawyerAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx

# Lawyer Information
LAWYER_EMAIL=ruhul.cse.duet@gmail.com
LAWYER_NAME=Ruhul (Advocate)

# Gmail IMAP — Client-এর আসা emails পড়ার জন্য
GMAIL_USER=ruhul.cse.duet@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Gmail SMTP — Emails পাঠানোর জন্য
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ruhul.cse.duet@gmail.com
SMTP_PASS=abcdefghijklmnop
```

> **OpenAI API Key** পাবে → https://platform.openai.com/api-keys

---

### Step 4 — Install ও Run করো

```cmd
cd C:\Users\ruhul\Desktop\project\ai-lawyer-assistant\server

npm install

npm run dev
```

সফলভাবে চললে দেখাবে:
```
✅ MongoDB Connected: localhost
✅ AI Update Job scheduled — runs at 8:00 AM & 8:00 PM (Dhaka time)
✅ Server running on port 5000
📧 Lawyer: ruhul.cse.duet@gmail.com
```

---

## 🔄 12-Hour Job কীভাবে কাজ করে

Job টি **প্রতিদিন সকাল ৮টা ও রাত ৮টায়** (Dhaka time) automatically চলে।

```
Job শুরু
   │
   ├─ Step 1: Gmail INBOX চেক করো
   │          নতুন unread client emails → MongoDB তে save করো
   │
   ├─ Step 2: DB থেকে শেষ 12 ঘন্টার
   │          সব incoming (client) messages পড়ো
   │
   ├─ Step 3: Messages গুলো client অনুযায়ী group করো
   │
   ├─ Step 4: OpenAI GPT কে পাঠাও
   │          → AI একটি professional update report তৈরি করে
   │          → "Client X বলেছেন..., Client Y জানতে চেয়েছেন..., Follow-up দরকার..."
   │
   ├─ Step 5: Report টি MongoDB তে save করো (AISummary collection)
   │
   └─ Step 6: Lawyer-এর Gmail-এ সুন্দর HTML email পাঠাও
              → Subject: "⚖️ Email Update: 5 client message(s) in last 12 hours"
```

---

## 💬 Legal Chatbot কীভাবে কাজ করে

Lawyer যখন `/api/chat/ask`-এ question পাঠান:

```
Lawyer → "চুক্তি ভঙ্গ হলে কী করতে পারি?"
              │
              ▼
         OpenAI GPT
    (Bangladesh Law expert)
              │
              ▼
   "Bangladesh Contract Act 1872
    এর Section 73 অনুযায়ী..."
              │
              ▼
         Lawyer পান উত্তর
```

- **chatHistory** পাঠালে AI আগের কথোপকথন মনে রাখে
- Bangladesh-এর সব major আইন সম্পর্কে জ্ঞান আছে

---

## 📡 API Endpoints

### 🤖 Legal Chatbot

#### `POST /api/chat/ask`
Lawyer আইনি প্রশ্ন করবেন।

**Request:**
```json
{
  "question": "চুক্তি ভঙ্গ হলে Bangladesh আইনে কী পদক্ষেপ নেওয়া যায়?",
  "chatHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "question": "চুক্তি ভঙ্গ হলে...",
  "answer": "Bangladesh Contract Act 1872 এর Section 73 অনুযায়ী...",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Multi-turn conversation (chatHistory ব্যবহার করে):**
```json
{
  "question": "এই ক্ষেত্রে কত দিনের মধ্যে মামলা করতে হবে?",
  "chatHistory": [
    { "role": "user", "content": "চুক্তি ভঙ্গ হলে কী করতে পারি?" },
    { "role": "assistant", "content": "Bangladesh Contract Act 1872..." }
  ]
}
```

---

### 📧 Email Management

#### `POST /api/emails/sync`
Gmail থেকে নতুন client emails manually sync করো।

**Response:**
```json
{
  "success": true,
  "synced": 3,
  "message": "3 new client email(s) synced from Gmail and saved to DB."
}
```

#### `POST /api/emails/send`
Lawyer থেকে Client কে email পাঠাও (Gmail দিয়ে যাবে + DB তে save হবে)।

**Request:**
```json
{
  "to": "client@gmail.com",
  "subject": "Your Case Update — Hearing Date",
  "body": "Dear Client,\n\nYour case hearing is scheduled for Monday, January 20th at 10:00 AM.",
  "conversationId": "65a1b2c3d4e5f6789"
}
```

#### `GET /api/emails/messages/:conversationId`
একটি conversation-এর সব messages দেখো (timeline order)।

---

### 🗂️ Conversations

#### `GET /api/conversations`
সব client conversations দেখো।

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
একটি conversation-এর সব details ও messages।

#### `PATCH /api/conversations/:id/status`
Conversation status পরিবর্তন করো।

**Request:**
```json
{ "status": "closed" }
```
Status options: `active` | `pending` | `closed`

---

### 📊 AI Summaries

#### `GET /api/summaries/latest`
সর্বশেষ AI-generated update report দেখো।

#### `GET /api/summaries`
সব past summaries দেখো (সর্বশেষ ৩০টি)।

#### `POST /api/summaries/trigger`
এখনই AI update job চালাও (12 ঘন্টা wait না করে)।

**Response:**
```json
{
  "success": true,
  "message": "AI update job triggered! Check server logs and your email inbox."
}
```

---

## 🧪 Postman দিয়ে Test করো

### Test 1 — Server চলছে কিনা
```
GET http://localhost:5000/
```

### Test 2 — Chatbot test করো
```
POST http://localhost:5000/api/chat/ask
Content-Type: application/json

{
  "question": "জমি বিক্রির চুক্তি কীভাবে করতে হয়?",
  "chatHistory": []
}
```

### Test 3 — Gmail sync করো (client emails আনো)
```
POST http://localhost:5000/api/emails/sync
```

### Test 4 — Client কে email পাঠাও
```
POST http://localhost:5000/api/emails/send
Content-Type: application/json

{
  "to": "client@gmail.com",
  "subject": "Case Update",
  "body": "Dear Client, please bring all documents on Monday."
}
```

### Test 5 — AI update job এখনই চালাও
```
POST http://localhost:5000/api/summaries/trigger
```
→ কয়েক সেকেন্ড পর তোমার Gmail-এ AI update email আসবে।

### Test 6 — সব conversations দেখো
```
GET http://localhost:5000/api/conversations
```

---

## 🛠️ Troubleshooting

| সমস্যা | কারণ | সমাধান |
|--------|------|--------|
| `MongoDB connection failed` | MongoDB service বন্ধ | CMD-এ: `net start MongoDB` |
| `IMAP Error: Invalid credentials` | App Password ভুল | Google Account → App Passwords → নতুন করে generate করো |
| `OpenAI error: 401` | API Key ভুল | platform.openai.com থেকে নতুন key নাও |
| `OpenAI error: 429` | Credit শেষ | OpenAI account-এ balance add করো |
| `Cannot find module` | packages install হয়নি | `npm install` আবার চালাও |
| Gmail sync কাজ করছে না | IMAP disabled | Gmail Settings → See all settings → Forwarding and POP/IMAP → IMAP enable করো |

---

## 📦 Tech Stack

| Technology | ব্যবহার |
|------------|---------|
| **Node.js + Express** | Backend server |
| **MongoDB + Mongoose** | Database — conversations ও messages store |
| **node-cron** | 12-hour automated job scheduling |
| **imap + mailparser** | Gmail থেকে emails পড়া |
| **nodemailer** | Emails পাঠানো |
| **OpenAI GPT-4o-mini** | AI summary generation ও legal chatbot |
| **dotenv** | Environment variables |

---

## 🔐 Security Notes

- `.env` file কখনো GitHub-এ push করবে না — `.gitignore`-এ রাখো
- Gmail-এর আসল password ব্যবহার করো না — সবসময় **App Password** ব্যবহার করো
- OpenAI API key private রাখো — publicly share করো না

---

## 📄 License

MIT License — Personal use only.
