"use client";

import { useEffect, useRef, useState } from "react";

export default function GlobalAlert() {
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (text?: unknown) => {
      setMessage(String(text ?? ""));

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setMessage("");
      }, 3500);
    };

    return () => {
      window.alert = originalAlert;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed right-5 top-5 z-[9999] w-[min(420px,calc(100vw-2rem))]">
      <div className="rounded-2xl border border-[#C9A227]/40 bg-white p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF9E8] text-lg font-bold text-[#C9A227]">
            !
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#0B1F3A]">
              Arunodaya Collections
            </p>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="text-lg font-medium text-gray-400 transition hover:text-[#0B1F3A]"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}