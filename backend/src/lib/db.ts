import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set in environment");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log(`[db] Connected to MongoDB at ${uri}`);
      return;
    } catch (err) {
      console.error(`[db] Connection attempt ${attempt}/${MAX_RETRIES} failed:`, err);
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

mongoose.connection.on("disconnected", () =>
  console.warn("[db] MongoDB disconnected")
);
