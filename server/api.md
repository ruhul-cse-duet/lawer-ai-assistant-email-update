# AI Lawyer Assistant API

Base URL: http://10.10.20.111:5000

All endpoints accept and return JSON unless noted.

## Health

### GET /
Returns a simple health payload.

Response
```json
{
  "status": "OK",
  "message": "AI Lawyer Assistant Running"
}
```

## Chat

### POST /api/chat/ask
Ask a legal question. Supports optional chat history (OpenAI-style messages array).

Request body
```json
{
  "question": "What is contract breach?",
  "chatHistory": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello" }
  ]
}
```

Response
```json
{
  "success": true,
  "question": "What is contract breach?",
  "answer": "...",
  "timestamp": "2026-05-05T10:00:00.000Z"
}
```

Errors
- 400 if `question` is missing or empty
- 500 if the AI service fails

## Emails

### POST /api/emails/send
Send an email from the lawyer to a client. Creates a conversation if `conversationId` is not provided.

Request body
```json
{
  "to": "client@example.com",
  "subject": "Your case update",
  "body": "Here is the update...",
  "conversationId": "66365cc64b2c2f5b5f9a2a11"
}
```

Response
```json
{
  "success": true,
  "messageId": "<message-id@example.com>",
  "conversationId": "66365cc64b2c2f5b5f9a2a11"
}
```

Errors
- 400 if `to`, `subject`, or `body` is missing

### POST /api/emails/sync
Manually sync unread Gmail messages into the system.

Response
```json
{
  "success": true,
  "synced": 3,
  "message": "3 new emails synced from Gmail"
}
```

### GET /api/emails/messages/:conversationId
Get all messages for a conversation.

Response
```json
{
  "success": true,
  "messages": [
    {
      "_id": "66365d1b4b2c2f5b5f9a2a12",
      "conversationId": "66365cc64b2c2f5b5f9a2a11",
      "sender": "client",
      "senderEmail": "client@example.com",
      "body": "...",
      "subject": "...",
      "emailId": "<message-id@example.com>",
      "direction": "incoming",
      "isRead": false,
      "createdAt": "2026-05-05T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    }
  ]
}
```

## Conversations

### GET /api/conversations
List conversations with optional filters and pagination.

Query params
- `status`: active | closed | pending
- `page`: number (default: 1)
- `limit`: number (default: 20)

Response
```json
{
  "success": true,
  "conversations": [
    {
      "_id": "66365cc64b2c2f5b5f9a2a11",
      "subject": "Case inquiry",
      "clientEmail": "client@example.com",
      "clientName": "Client Name",
      "lawyerEmail": "lawyer@example.com",
      "status": "active",
      "lastMessageAt": "2026-05-05T10:00:00.000Z",
      "messageCount": 2,
      "createdAt": "2026-05-05T09:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1
}
```

### GET /api/conversations/:id
Get a conversation with its messages.

Response
```json
{
  "success": true,
  "conversation": {
    "_id": "66365cc64b2c2f5b5f9a2a11",
    "subject": "Case inquiry",
    "clientEmail": "client@example.com",
    "clientName": "Client Name",
    "lawyerEmail": "lawyer@example.com",
    "status": "active",
    "lastMessageAt": "2026-05-05T10:00:00.000Z",
    "messageCount": 2,
    "createdAt": "2026-05-05T09:00:00.000Z",
    "updatedAt": "2026-05-05T10:00:00.000Z"
  },
  "messages": [
    {
      "_id": "66365d1b4b2c2f5b5f9a2a12",
      "conversationId": "66365cc64b2c2f5b5f9a2a11",
      "sender": "client",
      "senderEmail": "client@example.com",
      "body": "...",
      "subject": "...",
      "emailId": "<message-id@example.com>",
      "direction": "incoming",
      "isRead": false,
      "createdAt": "2026-05-05T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    }
  ]
}
```

Errors
- 404 if conversation is not found

### PATCH /api/conversations/:id/status
Update conversation status.

Request body
```json
{
  "status": "closed"
}
```

Response
```json
{
  "success": true,
  "conversation": {
    "_id": "66365cc64b2c2f5b5f9a2a11",
    "status": "closed"
  }
}
```

## Summaries

### GET /api/summaries
Get the latest summaries (up to 20).

Response
```json
{
  "success": true,
  "summaries": [
    {
      "_id": "66365e9b4b2c2f5b5f9a2a20",
      "summary": "...",
      "conversationCount": 2,
      "messageCount": 5,
      "fromDate": "2026-05-05T00:00:00.000Z",
      "toDate": "2026-05-05T12:00:00.000Z",
      "sentToLawyer": false,
      "sentAt": null,
      "createdAt": "2026-05-05T12:00:00.000Z",
      "updatedAt": "2026-05-05T12:00:00.000Z"
    }
  ]
}
```

### GET /api/summaries/latest
Get the most recent summary.

Response
```json
{
  "success": true,
  "summary": {
    "_id": "66365e9b4b2c2f5b5f9a2a20",
    "summary": "...",
    "conversationCount": 2,
    "messageCount": 5,
    "fromDate": "2026-05-05T00:00:00.000Z",
    "toDate": "2026-05-05T12:00:00.000Z",
    "sentToLawyer": false,
    "sentAt": null,
    "createdAt": "2026-05-05T12:00:00.000Z",
    "updatedAt": "2026-05-05T12:00:00.000Z"
  }
}
```

Errors
- 404 if no summary exists

### POST /api/summaries/trigger
Trigger the summary job (async).

Response
```json
{
  "success": true,
  "message": "Summary job triggered! Check logs and your email."
}
```

## Error Format

Most errors return a JSON payload like:
```json
{
  "error": "Error message"
}
```
