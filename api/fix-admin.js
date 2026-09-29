import connectDB from "./config/db.js";
import User from "./models/User.js";
import { hashPassword } from "./auth.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter new admin password: ", async (password) => {
  try {
    await connectDB();

    const user = await User.findOne({
      email: "sumadevadiga74@gmail.com",
    });

    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    user.password = await hashPassword(password);
    user.role = "admin";
    user.status = "active";

    await user.save();

    console.log("Admin account fixed successfully");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Status:", user.status);
    console.log("Password exists:", !!user.password);

    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
});