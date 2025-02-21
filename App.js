require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline-sync");
const Fuse = require("fuse.js"); // For fuzzy searching

// MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

// Define Schema & Model
const QA_Schema = new mongoose.Schema({
  question: { type: String, unique: true },
  answer: String,
});
const QA_Model = mongoose.model("QA", QA_Schema);

// Insert Initial Data
async function insertInitialData() {
  const initialData = [{ question: "What is your name?", answer: "My name is AI Agent." }];

  for (let item of initialData) {
    await QA_Model.updateOne({ question: item.question }, { $set: item }, { upsert: true });
  }
  console.log("✅ Default data inserted (or already exists)");
}

// Fetch all stored Q&A
async function getAllQuestions() {
  return await QA_Model.find();
}

// Start Chatbot
async function chat() {
  console.log("\n💬 AI Chatbot - Ask anything! (Type 'exit' to quit)");

  while (true) {
    const userInput = readline.question("\nYou: ").trim().toLowerCase();

    if (userInput === "exit") {
      console.log("Goodbye! 👋");
      mongoose.connection.close();
      break;
    }

    // Fetch all stored questions
    const allData = await getAllQuestions();
    const fuse = new Fuse(allData, { keys: ["question"], threshold: 0.2 }); // Low threshold for better matching

    // Search for the best match
    const result = fuse.search(userInput);

    if (result.length > 0) {
      const storedQuestion = result[0].item.question;
      const storedAnswer = result[0].item.answer;

      console.log("🤖 AI:", storedAnswer);
      
      // Allow user to update answer
      const updateChoice = readline.question("Type 'update' to change the answer or press Enter to continue: ").trim().toLowerCase();
      
      if (updateChoice === "update") {
        const newAnswer = readline.question("Enter the latest answer: ").trim();
        if (newAnswer) {
          await QA_Model.updateOne({ question: storedQuestion }, { $set: { answer: newAnswer } });
          console.log("✅ AI: Answer updated successfully.");
        }
      }
      
    } else {
      console.log("🤖 AI: I don't know the answer yet. Can you teach me?");
      const userAnswer = readline.question("Your Answer: ").trim();

      if (userAnswer) {
        await QA_Model.create({ question: userInput, answer: userAnswer });
        console.log("✅ AI: Got it! I'll remember this for next time.");
      }
    }
  }
}

// Run the chatbot
async function start() {
  await connectDB();
  await insertInitialData();
  chat();
}

start();
