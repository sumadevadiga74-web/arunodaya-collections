"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const BASKETS_QUERY = gql`
  query Baskets {
    baskets {
      id
      userId
      productId
      quantity
      status
    }
  }
`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const authUser = localStorage.getItem("authUser");
  setIsLoggedIn(!!authUser);
}, []);
  const { data } = useQuery<any>(BASKETS_QUERY, {
    fetchPolicy: "network-only",
  });

  const basketCount =
    data?.baskets
      ?.filter((basket: any) => basket.status === "active")
      .reduce(
        (total: number, basket: any) =>
          total + (basket.quantity || 0),
        0
      ) || 0;

  const closeMenu = () => {
    setMenuOpen(false);
  };
const handleLogout = () => {
  localStorage.removeItem("authUser");
  localStorage.removeItem("authToken");

  setIsLoggedIn(false);
  closeMenu();

  window.location.href = "/";
};

  /* =========================================================
     SEARCH
  ========================================================= */
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const search = searchText.trim();

    if (!search) {
      window.location.href = "/shop";
      return;
    }

    window.location.href = `/shop?search=${encodeURIComponent(search)}`;
  };

  return (
    <>
      {/* =========================================================
          ANNOUNCEMENT BAR
      ========================================================= */}
      <div className="bg-[#f2c12e] text-[#102f56]">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium sm:text-sm">
          Free delivery available in Davanagere • 7 Days Easy Exchange •
          Trusted Since 2006
        </div>
      </div>

      {/* =========================================================
          MAIN HEADER
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-[#dcae12] bg-[#102f56] shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6">

          {/* =====================================================
              LEFT SIDE
          ===================================================== */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-8">

            {/* MENU + LOGO */}
            <div className="flex shrink-0 items-center gap-1">

              {/* THREE LINE MENU */}
              <button
                type="button"
                onClick={() =>
                  setMenuOpen((value) => !value)
                }
                aria-label="Open customer menu"
                title="Menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10 hover:text-[#f2c12e]"
              >
                {menuOpen ? (
                  /* CLOSE ICON */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-7 w-7"
                  >
                    <path
                      d="M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  /* THREE LINE ICON */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-7 w-7"
                  >
                    <path
                      d="M4 7H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M4 12H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M4 17H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>

              {/* LOGO */}
              <Link
                href="/"
                className="shrink-0"
              >
                <img
                  src="/logo.png"
                  alt="Arunodaya Collections"
                  className="h-14 w-auto object-contain sm:h-16"
                />
              </Link>
            </div>

            {/* =================================================
                CATEGORIES
            ================================================= */}
            <nav className="hidden items-center gap-7 md:flex">

              <Link
                href="/shop"
                className="text-sm font-semibold text-white transition hover:text-[#f2c12e]"
              >
                Women
              </Link>

              <Link
                href="/shop"
                className="text-sm font-semibold text-white transition hover:text-[#f2c12e]"
              >
                Men
              </Link>

              <Link
                href="/shop"
                className="text-sm font-semibold text-white transition hover:text-[#f2c12e]"
              >
                Kids
              </Link>

            </nav>
          </div>

          {/* =====================================================
              RIGHT SIDE
          ===================================================== */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">

            {/* =================================================
                SEARCH BOX
            ================================================= */}
            <form
              onSubmit={handleSearch}
              className="flex h-10 min-w-0 w-[150px] items-center overflow-hidden rounded-full bg-white sm:h-11 sm:w-[240px] lg:w-[300px]"
            >

              {/* SEARCH ICON */}
              <div className="flex shrink-0 items-center pl-3 text-gray-500 sm:pl-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <path
                    d="M16 16L21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* SEARCH INPUT */}
              <input
                type="text"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Search products..."
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent px-2 text-xs text-gray-800 outline-none placeholder:text-gray-400 sm:px-3 sm:text-sm"
              />
            </form>

            {/* WISHLIST */}
<Link
  href="/wishlist"
  aria-label="Wishlist"
  title="Wishlist"
  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10 hover:text-[#f2c12e] sm:h-12 sm:w-12"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className="h-6 w-6"
  >
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</Link>

            {/* SHOPPING BAG */}
            <Link
              href="/basket"
              aria-label="Shopping Bag"
              title="Shopping Bag"
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10 hover:text-[#f2c12e] sm:h-12 sm:w-12"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7"
              >
                <path
                  d="M5 8.5H19L18 20H6L5 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />

                <path
                  d="M9 8.5V6.5C9 4.8 10.3 3.5 12 3.5C13.7 3.5 15 4.8 15 6.5V8.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              {/* BAG COUNT */}
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f2c12e] px-1 text-[9px] font-bold text-[#102f56]">
                {basketCount}
              </span>
            </Link>

          </div>
        </div>

        {/* =======================================================
            MOBILE CATEGORIES
        ======================================================= */}
        <div className="border-t border-white/10 md:hidden">
          <nav className="flex items-center justify-center gap-8 px-4 py-3">

            <Link
              href="/shop"
              className="text-sm font-semibold text-white hover:text-[#f2c12e]"
            >
              Women
            </Link>

            <Link
              href="/shop"
              className="text-sm font-semibold text-white hover:text-[#f2c12e]"
            >
              Men
            </Link>

            <Link
              href="/shop"
              className="text-sm font-semibold text-white hover:text-[#f2c12e]"
            >
              Kids
            </Link>

          </nav>
        </div>
      </header>

      {/* =========================================================
          CUSTOMER SIDE MENU
      ========================================================= */}
      {menuOpen && (
        <>
          {/* DARK OVERLAY */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className="fixed inset-0 z-[60] bg-black/40"
          />

          {/* SIDE MENU */}
          <aside className="fixed left-0 top-0 z-[70] flex h-full w-[310px] max-w-[85vw] flex-col bg-white shadow-2xl">

            {/* =================================================
                MENU HEADER
            ================================================= */}
            <div className="flex items-center justify-between border-b border-[#102f56]/10 bg-[#102f56] px-5 py-5">

              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-[#f2c12e]">
                  ARUNODAYA
                </p>

                <h2 className="mt-1 font-serif text-xl font-semibold text-white">
                  Customer Menu
                </h2>
              </div>

              {/* CLOSE */}
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 hover:text-[#f2c12e]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                >
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

            </div>

            {/* =================================================
                MENU LINKS
            ================================================= */}
            <nav className="flex-1 overflow-y-auto px-4 py-5">

              {/* HOME */}
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-[#102f56] transition hover:bg-[#f8f6ef] hover:text-[#b38a00]"
              >
                <span className="text-xl">🏠</span>
                <span className="font-medium">
                  Home
                </span>
              </Link>

              {/* MY ACCOUNT */}
              <Link
                href="/customer-account"
                onClick={closeMenu}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-[#102f56] transition hover:bg-[#f8f6ef] hover:text-[#b38a00]"
              >
                <span className="text-xl">👤</span>
                <span className="font-medium">
                  My Account
                </span>
              </Link>

              {/* MY ORDERS */}
              <Link
                href="/my-orders"
                onClick={closeMenu}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-[#102f56] transition hover:bg-[#f8f6ef] hover:text-[#b38a00]"
              >
                <span className="text-xl">📦</span>
                <span className="font-medium">
                  My Orders
                </span>
              </Link>

              {/* WISHLIST */}
              <Link
                href="/wishlist"
                onClick={closeMenu}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-[#102f56] transition hover:bg-[#f8f6ef] hover:text-[#b38a00]"
              >
                <span className="text-xl">❤️</span>
                <span className="font-medium">
                  Wishlist
                </span>
              </Link>

              {/* MY BASKET */}
              <Link
                href="/basket"
                onClick={closeMenu}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-[#102f56] transition hover:bg-[#f8f6ef] hover:text-[#b38a00]"
              >
                <span className="text-xl">🛒</span>

                <span className="font-medium">
                  My Basket
                </span>

                {basketCount > 0 && (
                  <span className="ml-auto rounded-full bg-[#f2c12e] px-2 py-0.5 text-xs font-bold text-[#102f56]">
                    {basketCount}
                  </span>
                )}
              </Link>

              {/* SHOP */}
              <Link
                href="/shop"
                onClick={closeMenu}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-[#102f56] transition hover:bg-[#f8f6ef] hover:text-[#b38a00]"
              >
                <span className="text-xl">🛍️</span>

                <span className="font-medium">
                  Shop
                </span>
              </Link>

              {/* CONTACT US */}
              <Link
                href="/contact"
                onClick={closeMenu}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-[#102f56] transition hover:bg-[#f8f6ef] hover:text-[#b38a00]"
              >
                <span className="text-xl">📞</span>

                <span className="font-medium">
                  Contact Us
                </span>
              </Link>

            </nav>

            {/* =================================================
                LOGOUT
            ================================================= */}
            <div className="border-t border-[#102f56]/10 p-4">
  {isLoggedIn ? (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-red-600 transition hover:bg-red-50"
    >
      <span className="text-xl">🚪</span>
      <span className="font-medium">Logout</span>
    </button>
  ) : (
    <Link
      href="/customer-login"
      onClick={closeMenu}
      className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-[#102f56] transition hover:bg-[#f8f6ef] hover:text-[#b38a00]"
    >
      <span className="text-xl">🔐</span>
      <span className="font-medium">Login</span>
    </Link>
  )}
</div>

          </aside>
        </>
      )}
    </>
  );
}