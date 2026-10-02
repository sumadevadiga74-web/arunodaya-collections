"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";

import Header from "../Header/Header";

const BASKETS_QUERY = gql`
  query Baskets {
    baskets {
      id
      userId
      productId
      size
      colour
      quantity
      status
    }
  }
`;

const PRODUCTS_BY_IDS_QUERY = gql`
  query ProductsByIds($ids: [ID!]!) {
    productsByIds(ids: $ids) {
      id
      name
      price
      image
      stock
      status
    }
  }
`;

const UPDATE_BASKET = gql`
  mutation UpdateBasket($id: ID!, $quantity: Int) {
    updateBasket(id: $id, quantity: $quantity) {
      id
      quantity
      status
    }
  }
`;

const DELETE_BASKET = gql`
  mutation DeleteBasket($id: ID!) {
    deleteBasket(id: $id) {
      id
    }
  }
`;

type BasketItem = {
  id: string;
  userId: string;
  productId: string;
  size?: string | null;
  colour?: string | null;
  quantity: number;
  status?: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  stock?: number | null;
  status?: string | null;
};

export default function Basket() {
  const [feedback, setFeedback] = useState<{
    type: "error" | "success" | "info";
    title: string;
    message: string;
  } | null>(null);

  const [removeBasketId, setRemoveBasketId] = useState<string | null>(null);

  // --------------------------------------------------
  // LOAD BASKETS
  // --------------------------------------------------

  const {
    data: basketData,
    loading: basketLoading,
    error: basketError,
    refetch: refetchBaskets,
  } = useQuery<{ baskets: BasketItem[] }>(BASKETS_QUERY, {
    fetchPolicy: "network-only",
  });

  const baskets = basketData?.baskets ?? [];

  console.log("?? BASKETS DATA:", baskets);
  console.log("?? BASKETS ERROR:", basketError);

  // --------------------------------------------------
  // ACTIVE BASKETS
  // --------------------------------------------------

  const activeBaskets = baskets.filter(
    (basket) => basket.status !== "inactive"
  );

  const productIds = activeBaskets
    .map((basket) => basket.productId)
    .filter(Boolean);

  console.log("?? PRODUCT IDS:", productIds);

  // --------------------------------------------------
  // LOAD PRODUCTS
  // --------------------------------------------------

  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useQuery<{ productsByIds: Product[] }>(
    PRODUCTS_BY_IDS_QUERY,
    {
      variables: {
        ids: productIds,
      },
      skip:
        basketLoading ||
        productIds.length === 0,
    }
  );

  const products = productData?.productsByIds ?? [];

  console.log("?? PRODUCTS DATA:", products);
  console.log("?? PRODUCTS ERROR:", productError);

  // --------------------------------------------------
  // MUTATIONS
  // --------------------------------------------------

  const [updateBasket, { loading: updating }] =
    useMutation<any>(UPDATE_BASKET);

  const [deleteBasket, { loading: deleting }] =
    useMutation<any>(DELETE_BASKET);

  // --------------------------------------------------
  // FIND PRODUCT
  // --------------------------------------------------

  const getProduct = (productId: string) => {
    return (
      products.find(
        (product) => String(product.id) === String(productId)
      ) ?? null
    );
  };

  // --------------------------------------------------
  // CHECKOUT
  // --------------------------------------------------

  const handleProceedToCheckout = () => {
    const checkoutItems = activeBaskets
      .map((basket) => {
        const product = getProduct(basket.productId);

        if (!product) {
          return null;
        }

        return {
          basketId: String(basket.id),
          productId: String(product.id),
          name: product.name,
          price: Number(product.price),
          quantity: Number(basket.quantity),
          size: basket.size || "",
          colour: basket.colour || "",
          image: product.image || "",
        };
      })
      .filter(
        (
          item
        ): item is {
          basketId: string;
          productId: string;
          name: string;
          price: number;
          quantity: number;
          size: string;
          colour: string;
          image: string;
        } => item !== null
      );

    if (checkoutItems.length === 0) {
      setFeedback({
        type: "info",
        title: "Your bag is empty",
        message: "Add at least one product before proceeding to checkout.",
      });
      return;
    }

    localStorage.setItem(
      "checkoutItems",
      JSON.stringify(checkoutItems)
    );

    window.location.href = "/checkout";
  };

  // --------------------------------------------------
  // TOTAL
  // --------------------------------------------------

  const grandTotal = activeBaskets.reduce(
    (total, basket) => {
      const product = getProduct(basket.productId);

      if (!product) {
        return total;
      }

      return (
        total +
        Number(product.price) * Number(basket.quantity)
      );
    },
    0
  );

  const totalItems = activeBaskets.reduce(
    (total, basket) => {
      return total + Number(basket.quantity);
    },
    0
  );

  // --------------------------------------------------
  // UPDATE QUANTITY
  // --------------------------------------------------

  const handleQuantityChange = async (
    basket: BasketItem,
    newQuantity: number
  ) => {
    const product = getProduct(basket.productId);

    if (!product) {
      setFeedback({
        type: "error",
        title: "Product unavailable",
        message: "Product information could not be loaded.",
      });
      return;
    }

    if (newQuantity < 1) {
      return;
    }

    if (
      product.stock !== undefined &&
      product.stock !== null &&
      newQuantity > product.stock
    ) {
      setFeedback({
        type: "info",
        title: "Stock limit reached",
        message: `Only ${product.stock} items are available.`,
      });
      return;
    }

    try {
      await updateBasket({
        variables: {
          id: basket.id,
          quantity: newQuantity,
        },
      });

      await refetchBaskets();
    } catch (err) {
      console.error(
        "UPDATE BASKET ERROR:",
        err
      );

      setFeedback({
        type: "error",
        title: "Unable to update quantity",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update quantity.",
      });
    }
  };

  // --------------------------------------------------
  // REMOVE ITEM
  // --------------------------------------------------

  const handleRemove = (basketId: string) => {
    setRemoveBasketId(basketId);
  };

  const confirmRemove = async () => {
    if (!removeBasketId) {
      return;
    }

    const basketId = removeBasketId;
    setRemoveBasketId(null);

    try {
      await deleteBasket({
        variables: {
          id: basketId,
        },
      });

      await refetchBaskets();

      setFeedback({
        type: "success",
        title: "Removed from bag",
        message: "The product has been removed from your shopping bag.",
      });
    } catch (err) {
      console.error(
        "DELETE BASKET ERROR:",
        err
      );

      setFeedback({
        type: "error",
        title: "Unable to remove product",
        message:
          err instanceof Error
            ? err.message
            : "Failed to remove product.",
      });
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (basketLoading || productLoading) {
    return (
      <main className="min-h-screen bg-[#f5f7fa]">
        <Header />

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="animate-pulse">
            <div className="mb-4 h-4 w-40 rounded bg-gray-200" />

            <div className="mb-8 h-10 w-64 rounded bg-gray-200" />

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="h-64 rounded-2xl bg-white shadow-sm" />

              <div className="h-64 rounded-2xl bg-white shadow-sm" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (basketError || productError) {
    console.error(
      "FINAL BASKET ERROR:",
      basketError || productError
    );

    const errorMessage =
      basketError?.message ||
      productError?.message ||
      "Unknown basket error.";

    return (
      <main className="min-h-screen bg-[#f5f7fa]">
        <Header />

        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-[#102f56]">
            Unable to load your basket
          </h1>

          <p className="mt-3 text-gray-600">
            Please check your login and try again.
          </p>

          {/* Temporary debugging message */}
          <div className="mx-auto mt-6 rounded-xl bg-red-50 p-4 text-left">
            <p className="text-xs font-bold uppercase text-red-700">
              GraphQL Error
            </p>

            <p className="mt-2 break-words text-sm text-red-600">
              {errorMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-[#102f56] px-6 py-3 font-semibold text-white"
          >
            Refresh Page
          </button>

          <Link
            href="/shop"
            className="mt-4 inline-flex rounded-full bg-[#f2c12e] px-6 py-3 font-semibold text-[#102f56] transition hover:bg-[#dcae12]"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4a915]">
            Arunodaya Collections
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#102f56] sm:text-4xl">
            Your Shopping Bag
          </h1>

          <p className="mt-2 text-gray-600">
            Review your selected products before checkout.
          </p>
        </div>

        {/* EMPTY */}
        {activeBaskets.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#fff7d6] text-4xl">
              ???
            </div>

            <h2 className="text-2xl font-bold text-[#102f56]">
              Your bag is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-600">
              Discover something you love and add it to your shopping bag.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex rounded-full bg-[#f2c12e] px-7 py-3 font-bold text-[#102f56] transition hover:bg-[#dcae12]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* ITEMS */}
            <div className="space-y-4">

              {activeBaskets.map((basket) => {
                const product = getProduct(
                  basket.productId
                );

                if (!product) {
                  return (
                    <div
                      key={basket.id}
                      className="rounded-3xl bg-white p-5 shadow-sm"
                    >
                      <p className="font-semibold text-red-600">
                        Product could not be loaded.
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Product ID: {basket.productId}
                      </p>
                    </div>
                  );
                }

                const itemTotal =
                  Number(product.price) *
                  Number(basket.quantity);

                const stock =
                  Number(product.stock) || 0;

                const isOutOfStock =
                  stock <= 0;

                return (
                  <div
                    key={basket.id}
                    className="rounded-3xl bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex gap-4">

                      {/* PRODUCT IMAGE */}
                      <Link
                        href={`/shop/${product.id}`}
                        className="shrink-0"
                      >
                        <img
                          src={
                            product.image ||
                            "/products/placeholder.png"
                          }
                          alt={product.name}
                          className="h-28 w-24 rounded-2xl object-cover sm:h-36 sm:w-28"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">

                        {/* PRODUCT NAME */}
                        <Link
                          href={`/shop/${product.id}`}
                        >
                          <h2 className="text-lg font-bold text-[#102f56] hover:underline">
                            {product.name}
                          </h2>
                        </Link>

                        {/* PRICE */}
                        <p className="mt-2 text-sm text-gray-600">
                          ?
                          {Number(
                            product.price
                          ).toFixed(0)}{" "}
                          each
                        </p>

                        {/* SIZE */}
                        {basket.size && (
                          <p className="mt-1 text-sm text-gray-600">
                            Size:{" "}
                            <span className="font-semibold text-[#102f56]">
                              {basket.size}
                            </span>
                          </p>
                        )}

                        {/* COLOUR */}
                        {basket.colour && (
                          <p className="mt-1 text-sm text-gray-600">
                            Colour:{" "}
                            <span className="font-semibold text-[#102f56]">
                              {basket.colour}
                            </span>
                          </p>
                        )}

                        {/* QUANTITY */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">

                          <div className="flex items-center overflow-hidden rounded-full border border-gray-200">

                            <button
                              type="button"
                              disabled={
                                updating ||
                                basket.quantity <= 1
                              }
                              onClick={() =>
                                handleQuantityChange(
                                  basket,
                                  basket.quantity - 1
                                )
                              }
                              className="px-3 py-2 text-lg font-bold text-[#102f56] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              -
                            </button>

                            <span className="min-w-10 text-center font-semibold text-[#102f56]">
                              {basket.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={
                                updating ||
                                isOutOfStock ||
                                basket.quantity >= stock
                              }
                              onClick={() =>
                                handleQuantityChange(
                                  basket,
                                  basket.quantity + 1
                                )
                              }
                              className="px-3 py-2 text-lg font-bold text-[#102f56] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          {stock > 0 &&
                            stock <= 10 && (
                              <span className="text-sm font-semibold text-[#c58d00]">
                                Only {stock} left
                              </span>
                            )}

                          {isOutOfStock && (
                            <span className="text-sm font-semibold text-red-600">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* TOTAL + DELETE */}
                        <div className="mt-4 flex items-center justify-between gap-4">

                          <p className="text-lg font-bold text-[#102f56]">
                            ?{itemTotal.toFixed(0)}
                          </p>

                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() =>
                              handleRemove(basket.id)
                            }
                            title="Remove from basket"
                            aria-label="Remove from basket"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-5 w-5"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v5" />
                              <path d="M14 11v5" />
                            </svg>
                          </button>

                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* ORDER SUMMARY */}
            <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-24">

              <h2 className="text-xl font-bold text-[#102f56]">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {totalItems}{" "}
                    {totalItems === 1
                      ? "item"
                      : "items"}{" "}
                    in your bag
                  </span>

                  <span className="font-semibold text-[#102f56]">
                    {totalItems}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[#102f56]">
                    ?{grandTotal.toFixed(0)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Delivery
                  </span>

                  <span className="font-semibold text-green-600">
                    FREE
                  </span>
                </div>

              </div>

              <div className="my-6 border-t border-gray-100" />

              <div className="flex items-center justify-between">

                <span className="text-lg font-bold text-[#102f56]">
                  Total
                </span>

                <span className="text-2xl font-bold text-[#102f56]">
                  ?{grandTotal.toFixed(0)}
                </span>

              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f2c12e] px-5 py-3.5 font-bold text-[#102f56] transition hover:bg-[#dcae12]"
              >
                Proceed to Checkout
                <span>?</span>
              </button>

              <Link
                href="/shop"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#102f56] transition hover:text-[#d4a915]"
              >
                <span>?</span>
                Continue Shopping
              </Link>

            </aside>
          </div>
        )}

        {/* INFORMATION */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="font-bold text-[#102f56]">
              ? Easy shopping
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Simple and secure checkout
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="font-bold text-[#102f56]">
              ? Quality collection
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Carefully selected products
            </p>
          </div>

        </div>

      </section>

      {/* BRANDED CONFIRMATION MODAL */}
      {removeBasketId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1F3A]/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF7D6] text-xl text-[#C9A227]">
              !
            </div>

            <h3 className="mt-5 text-xl font-bold text-[#102F56]">
              Remove this product?
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This product will be removed from your shopping bag.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRemoveBasketId(null)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#102F56] transition hover:border-[#C9A227] hover:bg-[#F8F9FB]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRemove}
                disabled={deleting}
                className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#162F55] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BRANDED FEEDBACK TOAST */}
      {feedback && (
        <div className="fixed inset-x-0 top-5 z-[110] flex justify-center px-4">
          <div
            className={`w-full max-w-lg rounded-2xl border bg-white p-4 shadow-2xl ${
              feedback.type === "success"
                ? "border-green-200"
                : feedback.type === "error"
                ? "border-red-200"
                : "border-[#C9A227]/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  feedback.type === "success"
                    ? "bg-green-50 text-green-600"
                    : feedback.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-[#FFF7D6] text-[#A87800]"
                }`}
              >
                {feedback.type === "success"
                  ? "?"
                  : feedback.type === "error"
                  ? "!"
                  : "i"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#102F56]">
                  {feedback.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {feedback.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="shrink-0 text-xl leading-none text-gray-400 transition hover:text-[#102F56]"
                aria-label="Close message"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

