"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { gql } from "@apollo/client";
import Header from "../../components/Header/Header";

const WISHLIST_QUERY = gql`
  query Wishlists {
    wishlists {
      id
      userId
      productId
      status
      createdAt
      product {
        id
        name
        price
        image
        category
        description
        stock
        status
      }
    }
  }
`;

const DELETE_WISHLIST_MUTATION = gql`
  mutation DeleteWishlist($id: ID!) {
    deleteWishlist(id: $id) {
      id
    }
  }
`;

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  category?: string | null;
  description?: string | null;
  stock?: number | null;
  status?: string | null;
};

type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  status?: string | null;
  createdAt?: string | null;
  product?: Product | null;
};

export default function WishlistPage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [removingWishlistId, setRemovingWishlistId] =
    useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("authUser");

      if (savedUser) {
        setAuthUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      setAuthUser(null);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<any>(WISHLIST_QUERY, {
    skip: !authChecked || !authUser,
    fetchPolicy: "network-only",
  });

  const [deleteWishlist] = useMutation<any>(
    DELETE_WISHLIST_MUTATION
  );

  /*
    Remove old wishlist records whose product no longer exists.
  */
  useEffect(() => {
    const cleanupWishlist = async () => {
      if (!data?.wishlists || !authUser) {
        return;
      }

      const invalidItems = data.wishlists.filter(
        (item: WishlistItem) => !item.product
      );

      if (invalidItems.length === 0) {
        return;
      }

      try {
        await Promise.all(
          invalidItems.map((item: WishlistItem) =>
            deleteWishlist({
              variables: {
                id: item.id,
              },
            })
          )
        );

        console.log(
          "Removed stale wishlist items:",
          invalidItems.map(
            (item: WishlistItem) => item.productId
          )
        );

        await refetch();
      } catch (cleanupError) {
        console.error(
          "Unable to clean old wishlist items:",
          cleanupError
        );
      }
    };

    cleanupWishlist();
  }, [data, authUser, deleteWishlist, refetch]);

  /*
    Remove product from wishlist.
  */
  const handleRemoveWishlist = async (
    wishlistId: string
  ) => {
    try {
      setRemovingWishlistId(wishlistId);

      await deleteWishlist({
        variables: {
          id: wishlistId,
        },
      });

      await refetch();
    } catch (removeError) {
      console.error(
        "Unable to remove product from wishlist:",
        removeError
      );

      alert(
        "Unable to remove this product from wishlist."
      );
    } finally {
      setRemovingWishlistId(null);
    }
  };

  if (!authChecked) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-[#f8f9fb]">
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-lg font-semibold text-[#0b1f3a]">
              Loading Wishlist...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!authUser) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-[#f8f9fb]">
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
              <div className="mb-4 text-5xl text-[#c9a227]">
                ♡
              </div>

              <h1 className="text-2xl font-bold text-[#0b1f3a]">
                Your Wishlist
              </h1>

              <p className="mt-3 text-gray-600">
                Please login to view your wishlist.
              </p>

              <Link
                href="/customer-login"
                className="mt-6 inline-block rounded-lg bg-[#c9a227] px-6 py-3 font-semibold text-white transition hover:bg-[#b18d1f]"
              >
                Login
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-[#f8f9fb]">
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-lg font-semibold text-[#0b1f3a]">
              Loading Wishlist...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-[#f8f9fb]">
          <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
              <h1 className="text-xl font-bold text-red-600">
                Unable to Load Wishlist
              </h1>

              <p className="mt-3 text-gray-600">
                {error.message}
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  /*
    Only show wishlist items whose product still exists.
  */
  const wishlistItems: WishlistItem[] = (
    data?.wishlists || []
  ).filter(
    (item: WishlistItem) => item.product
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f8f9fb]">

        {/* HERO */}
        <section className="bg-[#0b1f3a] px-6 py-12 text-center">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a227]">
              Arunodaya Collections
            </p>

            <h1 className="mt-3 text-4xl font-bold text-white">
              My Wishlist
            </h1>

            <p className="mt-3 text-gray-200">
              Your saved products
            </p>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

          {wishlistItems.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">

              <div className="text-6xl text-[#c9a227]">
                ♡
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#0b1f3a]">
                Your wishlist is empty
              </h2>

              <p className="mt-2 text-gray-600">
                Save your favourite products here.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-block rounded-lg bg-[#c9a227] px-6 py-3 font-semibold text-white transition hover:bg-[#b18d1f]"
              >
                Continue Shopping
              </Link>
            </div>

          ) : (

            <>
              {/* TITLE */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0b1f3a]">
                  Saved Products
                </h2>

                <span className="rounded-full bg-[#0b1f3a] px-4 py-2 text-sm font-semibold text-white">
                  {wishlistItems.length} item
                  {wishlistItems.length !== 1
                    ? "s"
                    : ""}
                </span>
              </div>

              {/* PRODUCT GRID */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {wishlistItems.map((item) => {
                  const product = item.product;

                  if (!product) {
                    return null;
                  }

                  const isRemoving =
                    removingWishlistId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >

                      {/* PRODUCT IMAGE */}
                      <div className="relative flex h-64 items-center justify-center bg-[#f8f9fb]">

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl text-[#c9a227]">
                            ♡
                          </span>
                        )}

                        {/* ❤️ WISHLIST BUTTON */}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveWishlist(item.id)
                          }
                          disabled={isRemoving}
                          aria-label="Remove from wishlist"
                          title="Remove from wishlist"
                          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isRemoving ? (
                            <span className="text-sm text-gray-500">
                              ...
                            </span>
                          ) : (
                            <span className="text-2xl leading-none text-red-500">
                              ♥
                            </span>
                          )}
                        </button>

                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="p-5">

                        {product.category && (
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
                            {product.category}
                          </p>
                        )}

                        <h3 className="mt-2 text-lg font-bold text-[#0b1f3a]">
                          {product.name}
                        </h3>
<p className="mt-2 text-xl font-bold text-[#0b1f3a]">
  {String.fromCharCode(8377)}
  {product.price.toFixed(2)}
</p>

                        {product.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                            {product.description}
                          </p>
                        )}
{product.stock !== undefined &&
  product.stock !== null &&
  product.stock > 0 &&
  product.stock <= 5 && (
    <p className="mt-3 text-sm font-semibold text-red-600">
      Only {product.stock} left
    </p>
  )}

                        <Link
                          href={`/shop/${product.id}`}
                          className="mt-5 block w-full rounded-lg bg-[#0b1f3a] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#16375f]"
                        >
                          View Product
                        </Link>

                      </div>
                    </div>
                  );
                })}

              </div>
            </>
          )}

        </section>
      </main>
    </>
  );
}