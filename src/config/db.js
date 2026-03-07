import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn("MONGO_URI missing. Running without MongoDB persistence.");
    return false;
  }

  if (isConnected) {
    return true;
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = true;
  console.log("MongoDB connected");
  return true;
}

export function hasDatabaseConnection() {
  return isConnected;
}
