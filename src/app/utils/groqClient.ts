import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function groqResponse(message: string) {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an acaedmic expert, you always cite your sources and base your response on the context in the articles that you have been provided.",
    },
    { role: "user", content: message },
  ];

  console.log("Starting groq api request");
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
  });
  console.log("received groq api request");

  return response.choices[0].message.content;
}
