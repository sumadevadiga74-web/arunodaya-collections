"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { FormEvent, useEffect, useState } from "react";

const CREATE_CONTACT = gql`
  mutation CreateContact(
    $name: String!
    $email: String!
    $phone: String
    $message: String!
    $status: String
  ) {
    createContact(
      name: $name
      email: $email
      phone: $phone
      message: $message
      status: $status
    ) {
      id
      name
      email
      phone
      message
      status
    }
  }
`;

export default function ContactPage() {
  const [createContact, { loading }] =
    useMutation<any>(CREATE_CONTACT);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Automatically fill customer details if logged in
  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("authUser");

      if (!savedUser) return;

      const user = JSON.parse(savedUser);

      if (user.role === "customer") {
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
      }
    } catch (err) {
      console.error(
        "Unable to load customer details:",
        err
      );
    }
  }, []);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      setError(
        "Please fill in your name, email and message."
      );
      return;
    }

    try {
      await createContact({
        variables: {
          name: name.trim(),
          email: email.trim(),
          phone:
            phone.trim() || undefined,
          message: message.trim(),
          status: "new",
        },
      });

      setSuccess(
        "Your message has been sent successfully. Our team will get back to you soon."
      );

      setMessage("");
    } catch (err) {
      console.error(
        "Contact submission failed:",
        err
      );

      setError(
        "Unable to send your message right now. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FB] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#0B1F3A]">
            Contact Us
          </h1>

          <p className="mt-2 text-gray-600">
            We would love to hear from you.
            Get in touch with Arunodaya Collections
            for general enquiries and information.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Information */}
          <div className="rounded-2xl bg-[#0B1F3A] p-8 text-white shadow-lg">
            <h2 className="text-2xl font-bold text-[#C9A227]">
              Get in Touch
            </h2>

            <p className="mt-4 leading-7 text-gray-200">
              Have a question, suggestion or general
              enquiry? Send us a message and our team
              will be happy to assist you.
            </p>

            <div className="mt-8 space-y-6">
              {/* General Enquiries */}
              <div>
                <h3 className="font-semibold text-[#C9A227]">
                  💬 General Enquiries
                </h3>

                <p className="mt-1 text-sm text-gray-300">
                  For general questions about
                  Arunodaya Collections, our products
                  or services.
                </p>
              </div>

              {/* Product Information */}
              <div>
                <h3 className="font-semibold text-[#C9A227]">
                  🛍️ Product Information
                </h3>

                <p className="mt-1 text-sm text-gray-300">
                  Feel free to contact us for general
                  information about our collections
                  and products.
                </p>
              </div>

              {/* Suggestions */}
              <div>
                <h3 className="font-semibold text-[#C9A227]">
                  💡 Suggestions & Feedback
                </h3>

                <p className="mt-1 text-sm text-gray-300">
                  We value your feedback and suggestions
                  and would love to hear from you.
                </p>
              </div>

              {/* Business Enquiries */}
              <div>
                <h3 className="font-semibold text-[#C9A227]">
                  🤝 Other Enquiries
                </h3>

                <p className="mt-1 text-sm text-gray-300">
                  For other general enquiries, please
                  send us a message using the form.
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-white/20 pt-6">
              <p className="text-sm text-gray-300">
                Arunodaya Collections
              </p>

              <p className="mt-1 text-sm text-gray-400">
                We are happy to hear from you.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#0B1F3A]">
              Send Us a Message
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Fill in the details below and send us
              your enquiry.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Write your enquiry here..."
                  rows={6}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </div>

              {/* Success */}
              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#C9A227] px-6 py-3 font-semibold text-[#0B1F3A] transition hover:bg-[#b89220] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending..."
                  : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}