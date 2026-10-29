
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
        description
        categories
        status
        mainMedia {
          type
          url
        }
        images {
          type
          url
        }
        items {
          id
          price
          sellingPrice
          mrp
          stock
          size
          colour
          images {
            type
            url
          }
        }
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

type ProductMedia = {
  type?: string | null;
  url?: string | null;
};

type ProductItem = {
  id: string;
  price?: number | null;
  sellingPrice?: number | null;
  mrp?: number | null;
  stock?: number | null;
  size?: string | null;
  colour?: string | null;
  images?: ProductMedia[] | null;
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  categories?: string[] | null;
  mainMedia?: ProductMedia[] | null;
  images?: ProductMedia[] | null;
  items?: ProductItem[] | null;
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

  // Remove wishlist records whose products no longer exist.
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
              variables: { id: item.id },
            })
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

  // Remove a product from the wishlist.
  const handleRemoveWishlist = async (
    wishlistId: string
  ) => {
    try {
      setRemovingWishlistId(wishlistId);

      await deleteWishlist({
        variables: { id: wishlistId },
      });

      await refetch();
    } catch (removeError) {
      console.error(
        "Unable to remove product from wishlist:",
        removeError
      );

      alert("Unable to remove this product from wishlist.");
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

  const wishlistItems: WishlistItem[] = (
    data?.wishlists || []
  ).filter((item: WishlistItem) => item.product);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f8f9fb]">
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
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-[#0b1f3a]">
                  Saved Products
                </h2>
                <span className="rounded-full bg-[#0b1f3a] px-4 py-2 text-sm font-semibold text-white">
                  {wishlistItems.length} item
                  {wishlistItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {wishlistItems.map((item) => {
                  const product = item.product;

                  if (!product) {
                    return null;
                  }

                  const productItems = product.items ?? [];

                  const pricedItem = productItems.find(
                    (variant) =>
                      Number(variant.sellingPrice ?? 0) > 0 ||
                      Number(variant.price ?? 0) > 0 ||
                      Number(variant.mrp ?? 0) > 0
                  );

                  const displayPrice =
                    pricedItem?.sellingPrice ||
                    pricedItem?.price ||
                    pricedItem?.mrp ||
                    0;

                  const productImage =
                    product.mainMedia?.find(
                      (media) => media.url?.trim()
                    )?.url ||
                    product.images?.find(
                      (media) => media.url?.trim()
                    )?.url ||
                    productItems
                      .flatMap((variant) => variant.images ?? [])
                      .find((media) => media.url?.trim())?.url;

                  const displayCategory =
                    product.categories?.[0];

                  const availableStock = productItems.reduce(
                    (total, variant) =>
                      total +
                      Math.max(0, Number(variant.stock ?? 0)),
                    0
                  );

                  const isRemoving =
                    removingWishlistId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* Product image */}
                      <div className="relative flex h-64 items-center justify-center bg-[#f8f9fb]">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={(event) => {
                              console.error(
                                "Wishlist image failed to load:",
                                productImage
                              );
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span className="text-6xl text-[#c9a227]">
                            ♡
                          </span>
                        )}

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

                      {/* Product details */}
                      <div className="p-5">
                        {displayCategory && (
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
                            {displayCategory}
                          </p>
                        )}

                        <h3 className="mt-2 text-lg font-bold text-[#0b1f3a]">
                          {product.name}
                        </h3>

                        <p className="mt-2 text-xl font-bold text-[#0b1f3a]">
                          ₹{Number(displayPrice).toFixed(2)}
                        </p>

                        {product.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                            {product.description}
                          </p>
                        )}

                        {availableStock > 0 &&
                          availableStock <= 5 && (
                            <p className="mt-3 text-sm font-semibold text-red-600">
                              Only {availableStock} left
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
