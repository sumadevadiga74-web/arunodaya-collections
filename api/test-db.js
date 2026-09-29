import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

dns.setServers(["8.8.8.8"]);

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("CONNECTED TO MONGODB");
  await mongoose.disconnect();
} catch (error) {
  console.error("CONNECTION FAILED:");
  console.error(error.message);
}