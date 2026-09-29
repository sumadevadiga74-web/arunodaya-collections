"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";

type OrderDetails = {
  orderId?: string;
  paymentMode?: string;
  totalAmount?: number;
};

const confetti = [
  { left: "5%", delay: "0s", duration: "3.5s", rotate: "25deg" },
  { left: "12%", delay: "0.5s", duration: "4s", rotate: "70deg" },
  { left: "20%", delay: "1.2s", duration: "3.2s", rotate: "120deg" },
  { left: "28%", delay: "0.2s", duration: "4.2s", rotate: "160deg" },
  { left: "36%", delay: "0.8s", duration: "3.6s", rotate: "210deg" },
  { left: "44%", delay: "1.5s", duration: "4s", rotate: "250deg" },
  { left: "52%", delay: "0.4s", duration: "3.4s", rotate: "300deg" },
  { left: "60%", delay: "1s", duration: "4.3s", rotate: "340deg" },
  { left: "68%", delay: "0.1s", duration: "3.7s", rotate: "45deg" },
  { left: "76%", delay: "0.7s", duration: "4.1s", rotate: "90deg" },
  { left: "84%", delay: "1.4s", duration: "3.5s", rotate: "135deg" },
  { left: "92%", delay: "0.3s", duration: "4.2s", rotate: "180deg" },
];

export default function OrderSuccessPage() {
  const [order, setOrder] =
    useState<OrderDetails | null>(null);

  useEffect(() => {
    try {
      const savedOrder =
        localStorage.getItem("lastOrder");

      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    } catch (error) {
      console.error(
        "Unable to read order details:",
        error
      );
    }
  }, []);

  const paymentMode =
    order?.paymentMode === "ONLINE"
      ? "Online Payment"
      : "Cash on Delivery";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fa]">

      {/* =====================================================
          CONFETTI
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {confetti.map((item, index) => (
          <span
            key={index}
            className="absolute top-[-30px] h-3 w-2 animate-confetti rounded-sm"
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
              transform: `rotate(${item.rotate})`,
            }}
          />
        ))}
      </div>

      {/* =====================================================
          CUSTOMER HEADER
      ====================================================== */}

      <Header />

      {/* =====================================================
          SUCCESS AREA
      ====================================================== */}

      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-5 py-10">

        <div className="w-full max-w-2xl">

          {/* =================================================
              SUCCESS CARD
          ================================================== */}

          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">

            {/* =================================================
                GREEN CELEBRATION TOP
            ================================================== */}

            <div className="relative overflow-hidden bg-green-600 px-6 py-12 text-center text-white sm:px-10">

              {/* Glow circles */}

              <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/10" />

              <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-white/10" />

              {/* Stars */}

              <div className="absolute left-[12%] top-8 text-2xl animate-pulse">
                ✨
              </div>

              <div className="absolute right-[14%] top-12 text-2xl animate-pulse">
                ✨
              </div>

              <div className="absolute left-[20%] bottom-8 text-xl animate-pulse">
                ⭐
              </div>

              <div className="absolute right-[20%] bottom-8 text-xl animate-pulse">
                ⭐
              </div>

              {/* =================================================
                  CHECK CIRCLE
              ================================================== */}

              <div className="relative mx-auto flex h-28 w-28 animate-success-pop items-center justify-center rounded-full bg-white shadow-2xl">

                <div className="absolute inset-0 animate-success-ring rounded-full border-4 border-white" />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-16 w-16 text-green-600"
                >
                  <path
                    d="M5 12.5L9.5 17L19 7.5"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-check"
                  />
                </svg>

              </div>

              {/* =================================================
                  HEADING
              ================================================== */}

              <h1 className="relative mt-7 text-3xl font-extrabold tracking-tight animate-title-pop sm:text-4xl">
                🎉 Order Placed Successfully!
              </h1>

              <p className="relative mx-auto mt-4 max-w-md text-sm leading-6 text-green-50 sm:text-base">
                Yay! Your order has been successfully
                placed. Thank you for shopping with
                Arunodaya Collections ❤️
              </p>

              {/* =================================================
                  CELEBRATION MESSAGE
              ================================================== */}

              <div className="relative mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold backdrop-blur-sm">
                🎊 Thank you for choosing us!
              </div>

            </div>

            {/* =================================================
                ORDER DETAILS
            ================================================== */}

            <div className="px-6 py-8 sm:px-10">

              <div className="rounded-2xl border border-gray-200 bg-[#f8f9fb] p-5">

                <h2 className="text-lg font-bold text-[#102f56]">
                  Order Details
                </h2>

                <div className="mt-5 space-y-4">

                  {/* Order ID */}

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-gray-500">
                      Order ID
                    </span>

                    <span className="break-all text-right text-sm font-bold text-[#102f56]">
                      {order?.orderId
                        ? `#${order.orderId}`
                        : "Your order"}
                    </span>

                  </div>

                  <div className="h-px bg-gray-200" />

                  {/* Payment Method */}

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-gray-500">
                      Payment Method
                    </span>

                    <span className="text-right text-sm font-semibold text-[#102f56]">
                      {paymentMode}
                    </span>

                  </div>

                  <div className="h-px bg-gray-200" />

                  {/* Total Amount */}

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-gray-500">
                      Total Amount
                    </span>

                    <span className="text-xl font-bold text-[#102f56]">
                      ₹
                      {Number(
                        order?.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </span>

                  </div>

                </div>

              </div>

              {/* =================================================
                  THANK YOU BOX
              ================================================== */}

              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">

                <div className="flex gap-3">

                  <div className="mt-0.5 text-xl text-green-600">
                    ✓
                  </div>

                  <div>

                    <p className="text-sm font-bold text-green-800">
                      Your order is on its way! 💚
                    </p>

                    <p className="mt-1 text-sm leading-6 text-green-700">
                      We have received your order and
                      will start processing it shortly.
                      You can track your order from
                      your orders page.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  BUTTONS
              ================================================== */}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">

                {/* My Orders */}
<Link
  href="/my-orders"
  className="flex items-center justify-center rounded-xl bg-[#102f56] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b2342]"
>
  📦 View My Orders
</Link>

                {/* Continue Shopping */}

                <Link
                  href="/shop"
                  className="flex items-center justify-center rounded-xl border-2 border-[#102f56] px-5 py-3.5 text-sm font-bold text-[#102f56] transition hover:bg-[#102f56] hover:text-white"
                >
                  🛍️ Continue Shopping
                </Link>

              </div>

              {/* =================================================
                  BACK HOME
              ================================================== */}

              <div className="mt-5 text-center">

                <Link
                  href="/"
                  className="text-sm font-semibold text-gray-500 transition hover:text-[#c39400]"
                >
                  ← Back to Home
                </Link>

              </div>

            </div>

          </div>

          {/* =================================================
              FOOTER TEXT
          ================================================== */}

          <p className="mt-6 text-center text-xs text-gray-400">
            Arunodaya Collections • Trusted Since 2006
          </p>

        </div>

      </section>

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}

      <style jsx>{`

        /* ================= CONFETTI ================= */

        @keyframes confetti {
          0% {
            transform: translateY(-40px) rotate(0deg);
            opacity: 1;
          }

          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-confetti {
          animation-name: confetti;
          animation-timing-function: linear;
          animation-iteration-count: 1;
        }

        .animate-confetti:nth-child(3n) {
          background: #facc15;
        }

        .animate-confetti:nth-child(3n + 1) {
          background: #ef4444;
        }

        .animate-confetti:nth-child(3n + 2) {
          background: #3b82f6;
        }

        /* ================= SUCCESS POP ================= */

        @keyframes success-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }

          60% {
            transform: scale(1.15);
            opacity: 1;
          }

          100% {
            transform: scale(1);
          }
        }

        .animate-success-pop {
          animation: success-pop 0.7s ease-out;
        }

        /* ================= SUCCESS RING ================= */

        @keyframes success-ring {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }

          70% {
            transform: scale(1.25);
            opacity: 0.5;
          }

          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-success-ring {
          animation: success-ring 1.2s ease-out;
        }

        /* ================= CHECK ANIMATION ================= */

        @keyframes check {
          0% {
            stroke-dasharray: 0 100;
            opacity: 0;
          }

          100% {
            stroke-dasharray: 100 0;
            opacity: 1;
          }
        }

        .animate-check {
          stroke-dasharray: 100;
          animation: check 0.7s ease-out 0.2s both;
        }

        /* ================= TITLE ANIMATION ================= */

        @keyframes title-pop {
          0% {
            transform: translateY(15px);
            opacity: 0;
          }

          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-title-pop {
          animation: title-pop 0.6s ease-out 0.3s both;
        }

      `}</style>

    </main>
  );
}