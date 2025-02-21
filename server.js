require("dotenv").config();
const OpenAI = require("openai");
const readline = require("readline-sync");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to ask AI a question
async function askAI() {
  while (true) {
    const prompt = readline.question("\nAsk a question (or type 'exit' to quit): ");

    if (prompt.toLowerCase() === "exit") {
      console.log("Goodbye!");
      break;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      console.log("\nAI:", response.choices[0].message.content);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

// Start asking questions
askAI();
