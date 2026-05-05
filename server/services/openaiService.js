const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────
//  12-Hour Job - summarize conversations from the DB
//  Tell the lawyer what clients said in emails today
// ─────────────────────────────────────────────────────────────
exports.generateConversationUpdate = async (conversationsText, periodHours = 12) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant working for a Bangladesh lawyer named ${process.env.LAWYER_NAME}.
Your job is to read the lawyer's email conversations with clients from the database and prepare a professional update report.

The report should:
1. Briefly summarize what each client discussed in their emails
2. Highlight any urgent legal matters or deadlines mentioned
3. List any action items the lawyer needs to follow up on
4. Flag any concerning issues (court dates, document requests, disputes)

Write in a clear, professional format. Use English. Be concise but complete.
Start the report with: "Here is your ${periodHours}-hour email conversation update:"`,
      },
      {
        role: "user",
        content: `Please prepare my email update report based on these client conversations from the last ${periodHours} hours:\n\n${conversationsText}`,
      },
    ],
    max_tokens: 2000,
  });

  return response.choices[0].message.content;
};

// ─────────────────────────────────────────────────────────────
//  Legal Chatbot - the lawyer can ask any legal question
//  The AI will answer based on Bangladesh law
// ─────────────────────────────────────────────────────────────
exports.legalChat = async (question, chatHistory = []) => {
  const messages = [
    {
      role: "system",
      content: `You are an expert AI legal assistant specializing in Bangladesh law, assisting lawyer ${process.env.LAWYER_NAME}.

You have deep knowledge of:
- Bangladesh Contract Act 1872
- Bangladesh Penal Code 1860  
- Code of Civil Procedure (CPC) 1908
- Code of Criminal Procedure (CrPC) 1898
- Muslim Family Laws Ordinance 1961
- Hindu Marriage Act
- Bangladesh Land Transfer Act
- Labour Act 2006
- Consumer Rights Protection Act 2009
- Negotiable Instruments Act 1881
- Evidence Act 1872
- Limitation Act 1908

Guidelines:
- Always answer based on Bangladesh law
- Provide relevant section/article numbers when applicable
- If you are unsure, clearly state the limitation
- Suggest the lawyer verify critical points with updated legislation
- Be professional, clear, and helpful`,
    },
    ...chatHistory,
    {
      role: "user",
      content: question,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 1200,
  });

  return response.choices[0].message.content;
};
