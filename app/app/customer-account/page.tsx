"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
};

type Address = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export default function CustomerAccountPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(false);

  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("authUser");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser?.role === "customer") {
          setUser(parsedUser);
        }
      }

      const savedAddress = localStorage.getItem("customerAddress");

      if (savedAddress) {
        setAddress(JSON.parse(savedAddress));
      }
    } catch (error) {
      console.error("Unable to load customer account:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    router.push("/customer-login");
  };

  const saveAddress = () => {
    localStorage.setItem("customerAddress", JSON.stringify(address));
    setEditingAddress(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FB] px-4 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </main>
    );
  }

  /* NOT LOGGED IN */
  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8F9FB] px-4 py-12">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#102f56] text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10"
            >
              <circle
                cx="12"
                cy="8"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M5 20C5.8 15.8 8.1 13.5 12 13.5C15.9 13.5 18.2 15.8 19 20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#102f56]">
            My Account
          </h1>

          <p className="mt-2 text-gray-600">
            Login to view your profile, orders, wishlist and basket.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/customer-login"
              className="flex-1 rounded-lg bg-[#102f56] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#0b2342]"
            >
              Login
            </Link>

            <Link
              href="/customer-register"
              className="flex-1 rounded-lg border-2 border-[#f2c12e] bg-[#f2c12e] px-5 py-3 text-center font-semibold text-[#102f56] transition hover:bg-[#dcae12]"
            >
              Create Account
            </Link>
          </div>

          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-[#102f56] hover:text-[#c9a227]"
          >
            ← Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* PAGE TITLE */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#102f56]">
            My Account
          </h1>

          <p className="mt-1 text-gray-600">
            Manage your profile, orders, wishlist and account settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* PROFILE */}
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-1">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#102f56] text-2xl font-bold text-[#f2c12e]">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-[#102f56]">
                  {user.name || "Customer"}
                </h2>

                <p className="truncate text-sm text-gray-500">
                  {user.email || "Email not available"}
                </p>
              </div>
            </div>

            <div className="space-y-5 pt-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {user.name || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </p>
                <p className="mt-1 break-all text-sm font-medium text-gray-800">
                  {user.email || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Phone
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {user.phone || "Not added"}
                </p>
              </div>
            </div>
          </section>

          {/* ACCOUNT MENU */}
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-5 text-xl font-bold text-[#102f56]">
              Account
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">

              <Link
                href="/my-orders"
                className="group rounded-xl border border-gray-200 p-5 transition hover:border-[#f2c12e] hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#102f56] text-white">
                    📦
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#102f56]">
                      My Orders
                    </h3>
                    <p className="text-sm text-gray-500">
                      View your orders
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/wishlist"
                className="group rounded-xl border border-gray-200 p-5 transition hover:border-[#f2c12e] hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#102f56] text-white">
                    ♡
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#102f56]">
                      My Wishlist
                    </h3>
                    <p className="text-sm text-gray-500">
                      View saved products
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/basket"
                className="group rounded-xl border border-gray-200 p-5 transition hover:border-[#f2c12e] hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#102f56] text-white">
                    🛍
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#102f56]">
                      My Basket
                    </h3>
                    <p className="text-sm text-gray-500">
                      View your shopping bag
                    </p>
                  </div>
                </div>
              </Link>

              <a
                href="/help-support"
                className="group rounded-xl border border-gray-200 p-5 transition hover:border-[#f2c12e] hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#102f56] text-white">
                    ?
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#102f56]">
                      Help & Support
                    </h3>
                    <p className="text-sm text-gray-500">
                      Contact our support team
                    </p>
                  </div>
                </div>
              </a>

            </div>
          </section>
        </div>

        {/* ADDRESS */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-[#102f56]">
                My Address
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage your delivery address.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditingAddress((value) => !value)}
              className="rounded-lg bg-[#102f56] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b2342]"
            >
              {editingAddress ? "Cancel" : "Edit Address"}
            </button>
          </div>

          {editingAddress ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <input
                type="text"
                placeholder="Full Name"
                value={address.name}
                onChange={(e) =>
                  setAddress({ ...address, name: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#102f56]"
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={address.phone}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#102f56]"
              />

              <textarea
                placeholder="Full Address"
                value={address.address}
                onChange={(e) =>
                  setAddress({ ...address, address: e.target.value })
                }
                rows={3}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#102f56] sm:col-span-2"
              />

              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#102f56]"
              />

              <input
                type="text"
                placeholder="State"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#102f56]"
              />

              <input
                type="text"
                placeholder="PIN Code"
                value={address.pincode}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#102f56]"
              />

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={saveAddress}
                  className="rounded-lg bg-[#f2c12e] px-6 py-3 font-semibold text-[#102f56] hover:bg-[#dcae12]"
                >
                  Save Address
                </button>
              </div>
            </div>
          ) : address.address ? (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="font-semibold text-gray-800">
                {address.name}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {address.phone}
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-700">
                {address.address}
                <br />
                {address.city}, {address.state} - {address.pincode}
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-500">
                No delivery address added yet.
              </p>

              <button
                type="button"
                onClick={() => setEditingAddress(true)}
                className="mt-3 font-semibold text-[#102f56] hover:text-[#c9a227]"
              >
                + Add Address
              </button>
            </div>
          )}
        </section>

        {/* LOGOUT */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-[#102f56]">
                Account Login
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Sign out from your customer account.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-red-300 px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </section>

        {/* CONTINUE SHOPPING */}
        <div className="py-8 text-center">
          <Link
            href="/"
            className="font-semibold text-[#102f56] hover:text-[#c9a227]"
          >
            ← Continue Shopping
          </Link>
        </div>

      </div>
    </main>
  );
}