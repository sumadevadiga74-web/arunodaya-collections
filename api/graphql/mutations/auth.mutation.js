import { randomBytes } from "node:crypto";

import User from "../../models/User.js";

import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../../auth.js";

import { firebaseAuth } from "../../firebase-admin.js";

import {
  sendPhoneOtp,
  sendEmailOtp,
} from "../../services/otp.service.js";
import Otp from "../../models/Otp.js";

export const authTypeDefs = `#graphql
  type AuthUser {
    id: ID!
    name: String!
    email: String!
    phone: String
    role: String!
    status: String!
  }

  type AuthPayload {
    token: String!
    user: AuthUser!
  }

  type OtpResponse {
    success: Boolean!
    message: String!
    identifier: String
  }

  extend type Mutation {
    registerUser(
      name: String!
      email: String!
      password: String!
      phone: String
      role: String
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!

    firebaseLogin(
      idToken: String!
    ): AuthPayload!

    sendOtp(
  identifier: String!
  type: String!
): OtpResponse!

verifyOtp(
  identifier: String!
  type: String!
  otp: String!
): AuthPayload!
  }
`;

const buildAuthPayload = (user) => {
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  };
};

export const authResolvers = {
  Mutation: {
    /* ---------------------------------- */
    /* OLD REGISTER - KEEP FOR NOW        */
    /* ---------------------------------- */

    registerUser: async (_, args) => {
      const {
        name,
        email,
        password,
        phone,
      } = args;

      const normalizedEmail =
        email.toLowerCase().trim();

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existingUser) {
        throw new Error(
          "User with this email already exists"
        );
      }

      const hashedPassword =
        await hashPassword(password);

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        role: "customer",
        status: "active",
      });

      return buildAuthPayload(user);
    },

    /* ---------------------------------- */
    /* OLD EMAIL/PASSWORD LOGIN           */
    /* ---------------------------------- */

    login: async (_, { email, password }) => {
      const normalizedEmail =
        email.toLowerCase().trim();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {
        throw new Error(
          "Invalid email or password"
        );
      }

      if (user.status !== "active") {
        throw new Error(
          "User account is inactive"
        );
      }

      const passwordValid =
        await comparePassword(
          password,
          user.password
        );

      if (!passwordValid) {
        throw new Error(
          "Invalid email or password"
        );
      }

      return buildAuthPayload(user);
    },

    /* ---------------------------------- */
    /* SEND OTP                            */
    /* ---------------------------------- */

    sendOtp: async (_, { identifier, type }) => {
      const normalizedType =
        type.toUpperCase();

      if (normalizedType === "PHONE") {
        return await sendPhoneOtp(identifier);
      }

      if (normalizedType === "EMAIL") {
        return await sendEmailOtp(identifier);
      }

      throw new Error(
        "OTP type must be PHONE or EMAIL."
      );
    },

    verifyOtp: async (_, { identifier, type, otp }) => {
  const normalizedType = type.toLowerCase();

  if (
    normalizedType !== "phone" &&
    normalizedType !== "email"
  ) {
    throw new Error(
      "OTP type must be PHONE or EMAIL."
    );
  }

  const normalizedIdentifier =
    normalizedType === "email"
      ? identifier.trim().toLowerCase()
      : `+91${identifier.replace(/\D/g, "").slice(-10)}`;

  if (!/^\d{6}$/.test(String(otp))) {
    throw new Error(
      "Enter a valid 6-digit OTP."
    );
  }

  const record = await Otp.findOne({
    identifier: normalizedIdentifier,
    type: normalizedType,
  });

  if (!record) {
    throw new Error(
      "No OTP found. Please request a new OTP."
    );
  }

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({
      _id: record._id,
    });

    throw new Error(
      "OTP expired. Please request a new OTP."
    );
  }

  if (record.attempts >= 5) {
    await Otp.deleteOne({
      _id: record._id,
    });

    throw new Error(
      "Too many incorrect attempts. Please request a new OTP."
    );
  }

  if (String(record.otp) !== String(otp)) {
    record.attempts =
      (record.attempts || 0) + 1;

    await record.save();

    throw new Error("Invalid OTP.");
  }

  // OTP is correct
  await Otp.deleteOne({
    _id: record._id,
  });

  const isEmail =
    normalizedType === "email";

  let user = isEmail
    ? await User.findOne({
        email: normalizedIdentifier,
      })
    : await User.findOne({
        phone: normalizedIdentifier,
      });

  // Create customer if this is the first login
  if (!user) {
    const internalEmail = isEmail
      ? normalizedIdentifier
      : `${normalizedIdentifier.replace(
          /\D/g,
          ""
        )}@phone.arunodaya.local`;

    const internalPassword =
      await hashPassword(
        randomBytes(32).toString("hex")
      );

    user = await User.create({
      name: "Arunodaya Customer",
      email: internalEmail,
      password: internalPassword,
      phone: isEmail
        ? undefined
        : normalizedIdentifier,
      role: "customer",
      status: "active",
    });
  }

  if (user.status !== "active") {
    throw new Error(
      "Your customer account is inactive."
    );
  }

  if (user.role !== "customer") {
    throw new Error(
      "This login is only for customer accounts."
    );
  }

  return buildAuthPayload(user);
},

    /* ---------------------------------- */
    /* GOOGLE + PHONE FIREBASE LOGIN       */
    /* KEEP FOR NOW                        */
    /* ---------------------------------- */

    firebaseLogin: async (_, { idToken }) => {
      let decodedToken;

      try {
        decodedToken =
          await firebaseAuth.verifyIdToken(
            idToken
          );
      } catch (error) {
        console.error(
          "Firebase token verification failed:",
          error
        );

        throw new Error(
          "Firebase authentication failed."
        );
      }

      const provider =
        decodedToken.firebase
          ?.sign_in_provider;

      if (
        provider !== "google.com" &&
        provider !== "phone"
      ) {
        throw new Error(
          "Only Google and Phone OTP login are allowed."
        );
      }

      const email =
        decodedToken.email
          ?.trim()
          .toLowerCase() || null;

      const phone =
        decodedToken.phone_number || null;

      if (!email && !phone) {
        throw new Error(
          "No email or phone number was provided by Firebase."
        );
      }

      const name =
        decodedToken.name?.trim() ||
        "Arunodaya Customer";

      let user = null;

      /* Find existing account by email */
      if (email) {
        user = await User.findOne({
          email,
        });
      }

      /* Otherwise find existing account by phone */
      if (!user && phone) {
        user = await User.findOne({
          phone,
        });
      }

      /* Existing account */
      if (user) {
        if (user.role !== "customer") {
          throw new Error(
            "This login is only for customer accounts."
          );
        }

        if (user.status !== "active") {
          throw new Error(
            "Your customer account is inactive."
          );
        }

        if (phone && !user.phone) {
          user.phone = phone;
          await user.save();
        }
      }

      /* New customer */
      if (!user) {
        const internalEmail =
          email ||
          `${phone.replace(
            /\D/g,
            ""
          )}@phone.arunodaya.local`;

        const internalPassword =
          await hashPassword(
            randomBytes(32).toString("hex")
          );

        user = await User.create({
          name,
          email: internalEmail,
          password: internalPassword,
          phone: phone || undefined,
          role: "customer",
          status: "active",
        });
      }

      return buildAuthPayload(user);
    },
  },
};