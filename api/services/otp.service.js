import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const normalizePhone = (phone) => {
  const value = phone.trim();

  if (value.startsWith("+")) {
    return value;
  }

  if (value.startsWith("91") && value.length === 12) {
    return `+${value}`;
  }

  if (value.length === 10) {
    return `+91${value}`;
  }

  throw new Error("Invalid phone number.");
};

export const sendPhoneOtp = async (phone) => {
  const mobile = normalizePhone(phone);
  const otp = generateOtp();

  await Otp.deleteMany({
    identifier: mobile,
    type: "phone",
  });

  await Otp.create({
    identifier: mobile,
    type: "phone",
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  const authkey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authkey || !templateId) {
    throw new Error("MSG91 configuration is missing.");
  }

  const response = await fetch(
    "https://control.msg91.com/api/v5/otp",
    {
      method: "POST",
      headers: {
        authkey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: mobile.replace("+", ""),
        otp,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok || result.type === "error") {
    console.error("MSG91 error:", result);

    await Otp.deleteOne({
      identifier: mobile,
      type: "phone",
      otp,
    });

    throw new Error("Failed to send OTP.");
  }

  return {
    success: true,
    message: "OTP sent successfully.",
    identifier: mobile,
  };
};

export const sendEmailOtp = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp();

  await Otp.deleteMany({
    identifier: normalizedEmail,
    type: "email",
  });

  await Otp.create({
    identifier: normalizedEmail,
    type: "email",
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error("Email configuration is missing.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  await transporter.sendMail({
    from: emailUser,
    to: normalizedEmail,
    subject: "Arunodaya Collections OTP",
    text: `Your Arunodaya Collections OTP is ${otp}. It is valid for 5 minutes.`,
  });

  return {
    success: true,
    message: "OTP sent successfully.",
    identifier: normalizedEmail,
  };
};