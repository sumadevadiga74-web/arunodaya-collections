import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "arunodaya-secret-key";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const getUserFromToken = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user || user.status !== "active") {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
};