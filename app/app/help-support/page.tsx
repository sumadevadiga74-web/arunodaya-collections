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

const supportCategories = [
  {
    icon: "📦",
    title: "Orders & Delivery",
    description:
      "Get help with your order status, delivery and order-related questions.",
  },
  {
    icon: "🔄",
    title: "Returns & Exchanges",
    description:
      "Need help with a return or exchange? Our support team can assist you.",
  },
  {
    icon: "💳",
    title: "Payments",
    description:
      "Having a problem with payment or checkout? Let us know.",
  },
  {
    icon: "🛍️",
    title: "Products & Sizes",
    description:
      "Questions about products, sizes, colours or availability?",
  },
];

const faqs = [
  {
    question: "Where can I check my order status?",
    answer:
      "You can check your order status from the My Orders section of your customer account.",
  },
  {
    question: "How can I cancel my order?",
    answer:
      "Open My Orders and check the available options for the order you want to cancel.",
  },
  {
    question: "How do I return a product?",
    answer:
      "If you need help with a return, contact our support team using the form below.",
  },
  {
    question: "What should I do if I receive a damaged product?",
    answer:
      "Please contact our support team and describe the issue. Our team will assist you with the next steps.",
  },
  {
    question: "What payment methods are available?",
    answer:
      "Payment options available to you will be shown during checkout.",
  },
  {
    question: "How do I choose the right size?",
    answer:
      "You can check the available sizes on the product details page before adding the product to your bag.",
  },
];

export default function HelpSupportPage() {
  const [createContact, { loading }] =
    useMutation(CREATE_CONTACT);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("authUser");

      if (!savedUser) {
        return;
      }

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
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

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
        "Your support request has been sent successfully. Our team will get back to you soon."
      );

      setMessage("");
    } catch (err) {
      console.error(
        "Support request submission failed:",
        err
      );

      setError(
        "Unable to send your request right now. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FB] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
            How can we help you?
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Find answers to common questions or
            contact our support team for assistance
            with your Arunodaya Collections order.
          </p>
        </div>

        {/* Support Categories */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#0B1F3A]">
              Help & Support
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose a category to find the type of
              help you need.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {supportCategories.map(
              (category) => (
                <div
                  key={category.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0B1F3A] text-xl">
                      {category.icon}
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#0B1F3A]">
                        {category.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#0B1F3A]">
              Frequently Asked Questions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quick answers to some common questions.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {faqs.map((faq, index) => {
              const isOpen =
                openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(
                        isOpen ? null : index
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-gray-50"
                  >
                    <span className="font-medium text-[#0B1F3A]">
                      {faq.question}
                    </span>

                    <span className="shrink-0 text-xl font-light text-[#C9A227]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-sm leading-6 text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Support */}
        <section className="mt-12">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            {/* Support Message */}
            <div className="rounded-2xl bg-[#0B1F3A] p-7 text-white shadow-lg">
              <h2 className="text-2xl font-bold text-[#C9A227]">
                Still need help?
              </h2>

              <p className="mt-4 leading-7 text-gray-200">
                Can't find what you're looking
                for? Send us a message and our
                support team will assist you.
              </p>

              <div className="mt-7 border-t border-white/20 pt-6">
                <p className="text-sm text-gray-300">
                  Arunodaya Collections
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Customer Support
                </p>
              </div>
            </div>

            {/* Support Form */}
            <div className="rounded-2xl bg-white p-7 shadow-lg">
              <h2 className="text-2xl font-bold text-[#0B1F3A]">
                Send us a message
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Tell us how we can help you.
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
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
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
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
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
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
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
                    onChange={(event) =>
                      setMessage(
                        event.target.value
                      )
                    }
                    placeholder="Tell us how we can help you..."
                    rows={5}
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
                    : "Send Query"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}