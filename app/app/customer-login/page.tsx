"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
 GoogleAuthProvider,
RecaptchaVerifier,
ConfirmationResult,
signInWithPhoneNumber,
signInWithPopup,
} from "firebase/auth";

import { auth } from "../../lib/firebase";

const FIREBASE_LOGIN = gql`
  mutation FirebaseLogin($idToken: String!) {
    firebaseLogin(idToken: $idToken) {
      token
      user {
        id
        name
        email
        phone
        role
        status
      }
    }
  }
`;

type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
};

export default function CustomerLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const redirectHandledRef = useRef(false);

  const [firebaseLogin] = useMutation(FIREBASE_LOGIN);

  // --------------------------------------------------
  // ERROR MESSAGE
  // --------------------------------------------------

  const getErrorMessage = (err: any) => {
    console.error("AUTH ERROR:", err);

    const code = err?.code || "";

    switch (code) {
      case "auth/popup-closed-by-user":
        return "Google login was cancelled.";

      case "auth/cancelled-popup-request":
        return "Google login was cancelled.";

      case "auth/account-exists-with-different-credential":
        return "This email already exists with another login method.";

      case "auth/invalid-email":
        return "Invalid email address.";

      case "auth/invalid-phone-number":
        return "Please enter a valid phone number.";

      case "auth/invalid-verification-code":
        return "Invalid OTP. Please check the OTP.";

      case "auth/code-expired":
        return "OTP expired. Please request a new OTP.";

      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";

      case "auth/quota-exceeded":
        return "OTP quota exceeded. Please try again later.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      default:
        return err?.message || "Something went wrong. Please try again.";
    }
  };

  // --------------------------------------------------
  // FINISH FIREBASE LOGIN
  // --------------------------------------------------

  const finishLogin = async (firebaseUser: any) => {
    console.log("STEP 1: Firebase user received");
    console.log("Firebase user:", firebaseUser);

    if (!firebaseUser) {
      throw new Error("Firebase user was not received.");
    }

    console.log("STEP 2: Getting Firebase ID token...");

    const idToken = await firebaseUser.getIdToken(true);

    console.log("STEP 3: Firebase ID token received");
    console.log("Token exists:", !!idToken);

    console.log("STEP 4: Calling GraphQL firebaseLogin...");

    const { data } = await firebaseLogin({
      variables: {
        idToken,
      },
    });

    console.log("STEP 5: GraphQL response:");
    console.log(data);

    const login = data?.firebaseLogin;

    if (!login) {
      throw new Error("Backend login failed.");
    }

    console.log("Backend user:", login.user);

    if (login.user.role !== "customer") {
      throw new Error("This login is only for customer accounts.");
    }

    if (login.user.status !== "active") {
      throw new Error("Your customer account is inactive.");
    }

    // Save login details
    localStorage.setItem("authToken", login.token);
    localStorage.setItem(
      "authUser",
      JSON.stringify(login.user)
    );

    console.log("STEP 6: Login details saved.");

    setSuccess("Login successful!");

    console.log("STEP 7: Redirecting to /home...");
    
router.push("/");
  };

  // --------------------------------------------------
  // GOOGLE LOGIN
  // --------------------------------------------------

  const handleGoogleLogin = async () => {
    if (loading) return;

    console.log("GOOGLE LOGIN BUTTON CLICKED");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      console.log("Starting Google redirect...");

    const result = await signInWithPopup(auth, provider);
await finishLogin(result.user);

      console.log("Google redirect started.");
    } catch (err) {
      console.error("Google login error:", err);

      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // RECAPTCHA
  // --------------------------------------------------

  const setupRecaptcha = () => {
    if (typeof window === "undefined") return;

    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    try {
      const verifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",
          callback: () => {
            console.log("reCAPTCHA completed.");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired.");
          },
        }
      );

      recaptchaVerifierRef.current = verifier;

      return verifier;
    } catch (err) {
      console.error("reCAPTCHA setup error:", err);
      throw err;
    }
  };

  // --------------------------------------------------
  // SEND PHONE OTP
  // --------------------------------------------------

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let formattedPhone = phone.trim();

      // If user enters 10 digits, automatically add +91
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = `+91${formattedPhone}`;
      }

      console.log("Sending OTP to:", formattedPhone);

      const appVerifier = setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmationResult(result);

      setSuccess("OTP sent successfully.");
    } catch (err) {
      console.error("Send OTP error:", err);

      setError(getErrorMessage(err));

      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // VERIFY PHONE OTP
  // --------------------------------------------------

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      setError("Please request OTP first.");
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Verifying OTP...");

      const result = await confirmationResult.confirm(
        otp.trim()
      );

      console.log("Phone Firebase user:", result.user);

      await finishLogin(result.user);
    } catch (err) {
      console.error("Verify OTP error:", err);

      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "#f8f8f8",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Customer Login
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "25px",
          }}
        >
          Login to Arunodaya Collections
        </p>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: "#ffe5e5",
              color: "#c00",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div
            style={{
              background: "#e5ffe9",
              color: "#087a21",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        )}

       {/* GOOGLE LOGIN */}
<button
  type="button"
  onClick={handleGoogleLogin}
  disabled={loading}
  style={{
    width: "100%",
    height: "48px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    cursor: loading ? "not-allowed" : "pointer",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "20px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  }}
>
  {loading ? (
    "Please wait..."
  ) : (
    <>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42z"
        />
        <path
          fill="#34A853"
          d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5z"
        />
        <path
          fill="#FBBC05"
          d="M6.54 13.59A5.85 5.85 0 0 1 6.23 12c0-.55.11-1.09.31-1.59V7.88H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.12l3.24-2.53z"
        />
        <path
          fill="#EA4335"
          d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.52 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38z"
        />
      </svg>

      <span>Continue with Google</span>
    </>
  )}
</button>

        {/* DIVIDER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "20px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#ddd",
            }}
          />

          <span
            style={{
              color: "#777",
              fontSize: "14px",
            }}
          >
            OR
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#ddd",
            }}
          />
        </div>

        {/* PHONE */}
        <label
          style={{
            display: "block",
            marginBottom: "7px",
            fontWeight: "600",
          }}
        >
          Phone Number
        </label>

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter 10 digit phone number"
          disabled={loading}
          style={{
            width: "100%",
            height: "45px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "0 12px",
            fontSize: "15px",
            marginBottom: "12px",
          }}
        />

        {/* RECAPTCHA */}
        <div
          id="recaptcha-container"
          style={{
            marginBottom: "15px",
          }}
        />

        {!confirmationResult ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            style={{
              width: "100%",
              height: "45px",
              border: "none",
              borderRadius: "8px",
              background: "#111",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600",
              }}
            >
              Enter OTP
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              disabled={loading}
              style={{
                width: "100%",
                height: "45px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "0 12px",
                fontSize: "15px",
                marginBottom: "12px",
              }}
            />

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading}
              style={{
                width: "100%",
                height: "45px",
                border: "none",
                borderRadius: "8px",
                background: "#111",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>
          </>
        )}

        {/* TERMS */}
        <p
          style={{
            marginTop: "25px",
            textAlign: "center",
            fontSize: "12px",
            color: "#777",
            lineHeight: "1.5",
          }}
        >
          By continuing, you agree to our Terms of Service
          and Privacy Policy.
        </p>
      </div>
    </div>
  );
}