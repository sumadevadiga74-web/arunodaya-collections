"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Products", path: "/products" },
  { name: "Categories", path: "/categories" },
  { name: "Brands", path: "/brands" },
  { name: "Colours", path: "/colours" },
  { name: "Sizes", path: "/sizes" },
  { name: "Basket", path: "/basket" },
  { name: "Orders", path: "/orders" },
  { name: "Reviews", path: "/reviews" },
  { name: "Users", path: "/users" },
  { name: "Articles", path: "/articles" },
  { name: "Contacts", path: "/contacts" },
  { name: "Contests", path: "/contests" },
  { name: "Participants", path: "/participants" },
  { name: "Sizechart", path: "/sizechart" },
  { name: "Settings", path: "/settings" },
  { name: "Pages", path: "/pages" },
];

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /* ==================================================
     CUSTOMER / PUBLIC PAGES
  ================================================== */

  const publicPages = [
    "/",
    "/shop",
    "/basket",
    "/checkout",
    "/order-success",
    "/my-orders",
    "/customer-orders",
    "/wishlist",
    "/customer-login",
    "/register",
    "/customer-register",
    "/customer-account",
    "/contact",
    "/help-support",
    "/product",
  ];

  /* ==================================================
     CUSTOMER PAGE CHECK
  ================================================== */

  if (
    publicPages.includes(pathname) ||
    pathname.startsWith("/shop/") ||
    pathname.startsWith("/product/")
  ) {
    return <>{children}</>;
  }

  /* ==================================================
     ADMIN PAGE INFORMATION
  ================================================== */

  const currentPage =
    menuItems.find(
      (item) =>
        pathname === item.path ||
        (item.path !== "/dashboard" &&
          pathname.startsWith(`${item.path}/`))
    )?.name || "Arunodaya Collections";

  const isActive = (path: string) => {
    return (
      pathname === path ||
      (path !== "/dashboard" &&
        pathname.startsWith(`${path}/`))
    );
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  /* ==================================================
     ADMIN LOGOUT
  ================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");

    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ==================================================
          DESKTOP SIDEBAR
      ================================================== */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-200 bg-white lg:flex">

        {/* BRAND */}

        <div className="border-b border-gray-200 px-6 py-5">

          <Link
            href="/dashboard"
            className="block"
          >
            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              Arunodaya Collections
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Admin Panel
            </p>
          </Link>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Management
          </p>

          <div className="space-y-1">

            {menuItems.map((item) => {

              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="truncate">
                    {item.name}
                  </span>
                </Link>
              );

            })}

          </div>

        </nav>

        {/* FOOTER */}

        <div className="border-t border-gray-200 p-4">

          <p className="text-xs font-medium text-gray-500">
            Arunodaya Collections
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Admin Dashboard
          </p>

        </div>

      </aside>

      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* ==================================================
          MOBILE SIDEBAR
      ================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 lg:hidden ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* MOBILE BRAND */}

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5">

          <Link
            href="/dashboard"
            onClick={closeMobileMenu}
          >
            <h1 className="text-lg font-bold text-gray-900">
              Arunodaya Collections
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Admin Panel
            </p>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            ×
          </button>

        </div>

        {/* MOBILE NAV */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Management
          </p>

          <div className="space-y-1">

            {menuItems.map((item) => {

              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              );

            })}

          </div>

        </nav>

        {/* MOBILE FOOTER */}

        <div className="border-t border-gray-200 p-4">

          <p className="text-xs text-gray-500">
            Arunodaya Collections
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Admin Dashboard
          </p>

        </div>

      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="min-h-screen lg:ml-64">

        {/* HEADER */}

        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">

          {/* LEFT SIDE */}

          <div className="flex min-w-0 items-center gap-3">

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              aria-label="Open navigation"
              className="rounded-lg border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-100 lg:hidden"
            >
              <span className="block h-0.5 w-5 bg-current" />
              <span className="mt-1.5 block h-0.5 w-5 bg-current" />
              <span className="mt-1.5 block h-0.5 w-5 bg-current" />
            </button>

            {/* PAGE TITLE */}

            <div className="min-w-0">

              <h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                {currentPage}
              </h2>

              <p className="hidden text-xs text-gray-500 sm:block">
                Manage your Arunodaya Collections
              </p>

            </div>

          </div>

          {/* ADMIN PROFILE + LOGOUT */}

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
              A
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Logout
            </button>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <main className="min-w-0">
          {children}
        </main>

      </div>

    </div>
  );
}