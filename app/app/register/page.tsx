"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const REGISTER = gql`
  mutation Register(
    $name: String!
    $email: String!
    $password: String!
    $phone: String
  ) {
    registerUser(
      name: $name
      email: $email
      password: $password
      phone: $phone
    ) {
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

export default function RegisterPage() {
  const router = useRouter();

  const [register, { loading }] = useMutation<any>(REGISTER);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email and password are required.");
      return;
    }

    try {
      const result = await register({
        variables: {
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
        },
      });

      const auth = result.data?.registerUser;

      if (!auth) {
        setError("Registration failed.");
        return;
      }

      localStorage.setItem("authToken", auth.token);

      localStorage.setItem(
        "authUser",
        JSON.stringify(auth.user)
      );

      router.push("/");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Registration failed."
      );
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8f8f8 0%, #f3f0e8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "#fff",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 15px 45px rgba(0,0,0,0.10)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {/* ================================
            LEFT BRAND PANEL
        ================================= */}

        <div
          style={{
            background:
              "linear-gradient(145deg, #102f56 0%, #163f70 55%, #0b2342 100%)",
            padding: "55px 45px",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}

          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              border: "1px solid rgba(242,193,46,0.18)",
              top: "-80px",
              right: "-80px",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              border: "1px solid rgba(242,193,46,0.15)",
              bottom: "-60px",
              left: "-50px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* LOGO */}

            <img
              src="/logo.png"
              alt="Arunodaya Collections"
              style={{
                width: "220px",
                height: "auto",
                objectFit: "contain",
                marginBottom: "35px",
              }}
            />

            {/* GOLD LINE */}

            <div
              style={{
                width: "55px",
                height: "4px",
                borderRadius: "20px",
                background: "#f2c12e",
                marginBottom: "25px",
              }}
            />

            <h1
              style={{
                fontSize: "38px",
                lineHeight: "1.15",
                fontWeight: "800",
                margin: 0,
                marginBottom: "18px",
              }}
            >
              Join Arunodaya
            </h1>

            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.8",
                color: "rgba(255,255,255,0.75)",
                maxWidth: "360px",
                margin: 0,
              }}
            >
              Create your account and discover
              the latest collection from
              Arunodaya Collections.
            </p>

            {/* BENEFITS */}

            <div
              style={{
                marginTop: "35px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <span
                  style={{
                    width: "30px",
                    height: "30px",
                    minWidth: "30px",
                    borderRadius: "50%",
                    background: "#f2c12e",
                    color: "#102f56",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                  }}
                >
                  ✓
                </span>

                Explore the latest styles
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <span
                  style={{
                    width: "30px",
                    height: "30px",
                    minWidth: "30px",
                    borderRadius: "50%",
                    background: "#f2c12e",
                    color: "#102f56",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                  }}
                >
                  ✓
                </span>

                Easy shopping experience
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <span
                  style={{
                    width: "30px",
                    height: "30px",
                    minWidth: "30px",
                    borderRadius: "50%",
                    background: "#f2c12e",
                    color: "#102f56",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                  }}
                >
                  ✓
                </span>

                Trusted since 2006
              </div>
            </div>
          </div>
        </div>

        {/* ================================
            RIGHT REGISTER PANEL
        ================================= */}

        <div
          style={{
            padding: "45px 40px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            {/* TOP LABEL */}

            <div
              style={{
                textAlign: "center",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  margin: "0 auto 16px",
                  borderRadius: "50%",
                  background: "#fff8df",
                  border: "1px solid #f2c12e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="#102f56"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M4 21c.7-4.2 3.4-6.5 8-6.5s7.3 2.3 8 6.5"
                    stroke="#102f56"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#c39400",
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                }}
              >
                Customer Account
              </p>

              <h2
                style={{
                  margin: "8px 0 0",
                  color: "#102f56",
                  fontSize: "30px",
                  lineHeight: "1.2",
                  fontWeight: "800",
                }}
              >
                Create Account
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                Create your account to start shopping.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div
                style={{
                  background: "#fff0f0",
                  border: "1px solid #ffcaca",
                  color: "#c62828",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  marginBottom: "18px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#333",
                  }}
                >
                  Full Name
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#999",
                    }}
                  >
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="8"
                        r="3.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <path
                        d="M5 20c.8-4.2 3.1-6.5 7-6.5s6.2 2.3 7 6.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    autoComplete="name"
                    style={{
                      width: "100%",
                      height: "46px",
                      boxSizing: "border-box",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      background: "#fafafa",
                      padding: "0 14px 0 44px",
                      fontSize: "14px",
                      outline: "none",
                      color: "#222",
                    }}
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#333",
                  }}
                >
                  Email Address
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#999",
                    }}
                  >
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <rect
                        x="4"
                        y="6.5"
                        width="16"
                        height="11"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <path
                        d="m4 7 8 6 8-6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    style={{
                      width: "100%",
                      height: "46px",
                      boxSizing: "border-box",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      background: "#fafafa",
                      padding: "0 14px 0 44px",
                      fontSize: "14px",
                      outline: "none",
                      color: "#222",
                    }}
                  />
                </div>
              </div>

              {/* PHONE */}

              <div>
                <label
                  htmlFor="phone"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#333",
                  }}
                >
                  Phone Number
                  <span
                    style={{
                      marginLeft: "5px",
                      color: "#aaa",
                      fontWeight: "400",
                    }}
                  >
                    (optional)
                  </span>
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#999",
                    }}
                  >
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6.5 3.5h3l1.2 4.2-1.8 1.5a14.7 14.7 0 0 0 6 6l1.5-1.8 4.1 1.2v3c0 1.1-.9 2-2 2C11.6 19.6 4.4 12.4 4.4 5.5c0-1.1.9-2 2.1-2Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    autoComplete="tel"
                    style={{
                      width: "100%",
                      height: "46px",
                      boxSizing: "border-box",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      background: "#fafafa",
                      padding: "0 14px 0 44px",
                      fontSize: "14px",
                      outline: "none",
                      color: "#222",
                    }}
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#333",
                  }}
                >
                  Password
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#999",
                    }}
                  >
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <path
                        d="M8 10V7a4 4 0 0 1 8 0v3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    style={{
                      width: "100%",
                      height: "46px",
                      boxSizing: "border-box",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      background: "#fafafa",
                      padding: "0 48px 0 44px",
                      fontSize: "14px",
                      outline: "none",
                      color: "#222",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#999",
                      padding: "5px",
                    }}
                  >
                    {showPassword ? (
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 3l18 18"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M9.9 4.3A10.5 10.5 0 0 1 12 4c5 0 8.4 4 9.5 6-.4.8-1.3 2.2-2.8 3.5M6.5 6.5C4.2 8 3.1 9.7 2.5 10"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "48px",
                  border: "none",
                  borderRadius: "10px",
                  background: loading
                    ? "#dfbd55"
                    : "#f2c12e",
                  color: "#102f56",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "14px",
                  fontWeight: "800",
                  boxShadow:
                    "0 5px 15px rgba(194,148,0,0.18)",
                  marginTop: "4px",
                }}
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            {/* LOGIN */}

            <p
              style={{
                margin: "22px 0 0",
                textAlign: "center",
                fontSize: "13px",
                color: "#777",
              }}
            >
              Already have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  router.push("/customer-login")
                }
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  color: "#c39400",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Sign in
              </button>
            </p>

            {/* SHOPPING */}

            <Link
              href="/shop"
              style={{
                display: "block",
                marginTop: "18px",
                textAlign: "center",
                fontSize: "12px",
                color: "#888",
                textDecoration: "none",
              }}
            >
              ← Continue Shopping
            </Link>

            {/* TERMS */}

            <p
              style={{
                marginTop: "20px",
                textAlign: "center",
                fontSize: "11px",
                lineHeight: "1.5",
                color: "#aaa",
              }}
            >
              By creating an account, you agree to our
              Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* RESPONSIVE MOBILE FIX */}

      <style jsx>{`
        @media (max-width: 768px) {
          main {
            padding: 15px !important;
          }

          main > div {
            display: block !important;
            max-width: 460px !important;
          }

          main > div > div:first-child {
            display: none !important;
          }

          main > div > div:last-child {
            padding: 35px 22px !important;
          }
        }
      `}</style>
    </main>
  );
}