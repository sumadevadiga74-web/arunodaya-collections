"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
        status
      }
    }
  }
`;

type LoginResponse = {
  login: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
    };
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [login, { loading }] =
    useMutation<LoginResponse>(LOGIN);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    try {
      const result = await login({
        variables: {
          email,
          password,
        },
      });

      const auth = result.data?.login;

      if (!auth) {
        setErrorMessage("Login failed.");
        return;
      }

      if (auth.user.role !== "admin") {
        setErrorMessage(
          "You do not have permission to access the Admin Panel."
        );
        return;
      }
localStorage.setItem("authToken", auth.token);

localStorage.setItem(
  "authUser",
  JSON.stringify(auth.user)
);

      router.push("/dashboard");
    } catch (err) {
      console.error(err);

      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Invalid email or password."
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Arunodaya Collections
          </h1>

          <p className="mt-2 text-gray-500">
            Admin Panel Login
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

      </div>
    </main>
  );
}