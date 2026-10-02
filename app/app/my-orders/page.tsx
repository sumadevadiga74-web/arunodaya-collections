"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type OrderItem = {
  productId: string;
  quantity: number;
  size?: string;
  colour?: string;
  totalAmount: number;
};

type TrackingHistoryItem = {
  status: string;
  message?: string;
  date?: string;
};

type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMode?: string;
  status: string;

  trackingStatus?: string;
  trackingHistory?: TrackingHistoryItem[];

  createdAt: string;
  cancellationReason?: string;
  cancellationDate?: string;
};

type Product = {
  id: string;
  name: string;
  image?: string;
  price?: number;
};

type ReviewForm = {
  productId: string;
  rating: number;
  comment: string;
};

/* =========================================================
   GRAPHQL
========================================================= */

const ORDERS_QUERY = gql`
  query Orders {
    orders {
      id
      userId

      items {
        productId
        quantity
        size
        colour
        totalAmount
      }

      totalAmount
      paymentMode
      status

      trackingStatus

      trackingHistory {
        status
        message
        date
      }

      createdAt
      cancellationReason
      cancellationDate
    }
  }
`;

const PRODUCTS_QUERY = gql`
  query Products {
    products(page: 1, limit: 1000) {
      products {
        id
        name
        image
        price
      }
    }
  }
`;

const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder(
    $id: ID!
    $cancellationReason: String!
  ) {
    cancelOrder(
      id: $id
      cancellationReason: $cancellationReason
    ) {
      id
      status
      cancellationReason
      cancellationDate
    }
  }
`;

const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview(
    $productId: ID!
    $rating: Int!
    $comment: String!
  ) {
    createReview(
      productId: $productId
      rating: $rating
      comment: $comment
    ) {
      id
      productId
      rating
      comment
    }
  }
`;

/* =========================================================
   CUSTOMER TRACKING
========================================================= */

/*
 * Confirmed exists in the backend, but is intentionally
 * hidden from the customer-facing timeline.
 *
 * Customer sees only these 6 stages:
 *
 * 1. Order Placed
 * 2. Packed
 * 3. Shipped
 * 4. In Transit
 * 5. Out for Delivery
 * 6. Delivered
 */

const trackingSteps = [
  "order_placed",
  "packed",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

const trackingMessages: Record<string, string> = {
  order_placed:
    "Your order has been received.",

  confirmed:
    "Your order has been confirmed and is being prepared.",

  packed:
    "Your order has been packed and is ready for dispatch.",

  shipped:
    "Your package has left our warehouse.",

  in_transit:
    "Your package is on the way.",

  out_for_delivery:
    "Your package is nearby and will be delivered soon.",

  delivered:
    "Your order has been delivered successfully.",
};

const normalizeStatus = (status?: string) => {
  return (status || "").toLowerCase().trim();
};

const formatTrackingStatus = (status: string) => {
  switch (normalizeStatus(status)) {
    case "order_placed":
      return "Order Placed";

    case "confirmed":
      return "Confirmed";

    case "packed":
      return "Packed";

    case "shipped":
      return "Shipped";

    case "in_transit":
      return "In Transit";

    case "out_for_delivery":
      return "Out for Delivery";

    case "delivered":
      return "Delivered";

    default:
      return "Order Placed";
  }
};

/* =========================================================
   STATUS STYLE
========================================================= */

const getStatusStyle = (value?: string) => {
  switch (normalizeStatus(value)) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "processing":
      return "bg-blue-100 text-blue-700";

    case "completed":
      return "bg-green-100 text-green-700";

    case "delivered":
      return "bg-emerald-100 text-emerald-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

/* =========================================================
   PAGE
========================================================= */

export default function MyOrdersPage() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [cancelReason, setCancelReason] =
    useState("");

  const [reviewForm, setReviewForm] =
    useState<ReviewForm | null>(null);

  const [reviewMessage, setReviewMessage] =
    useState("");

  /* =========================================================
     AUTH USER
  ========================================================= */

  useEffect(() => {
    const storedUser =
      localStorage.getItem("authUser");

    if (!storedUser) {
      router.push("/customer-login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (!user?.id) {
        router.push("/customer-login");
        return;
      }

      setCurrentUserId(user.id);
    } catch {
      router.push("/customer-login");
    }
  }, [router]);

  /* =========================================================
     ORDERS
  ========================================================= */

  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery<any>(ORDERS_QUERY, {
    skip: !currentUserId,
    fetchPolicy: "network-only",
  });

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const {
    data: productsData,
  } = useQuery<any>(PRODUCTS_QUERY, {
    fetchPolicy: "cache-first",
  });

  /* =========================================================
     MUTATIONS
  ========================================================= */

  const [cancelOrder, { loading: cancelling }] =
    useMutation<any>(CANCEL_ORDER_MUTATION);

  const [createReview, { loading: creatingReview }] =
    useMutation<any>(CREATE_REVIEW_MUTATION);

  /* =========================================================
     DATA
  ========================================================= */

  const allOrders: Order[] =
    ordersData?.orders || [];

  const orders = allOrders.filter(
    (order: Order) =>
      String(order.userId) ===
      String(currentUserId)
  );

  const products: Product[] =
    productsData?.products?.products || [];

  /* =========================================================
     PRODUCT FINDER
  ========================================================= */

  const getProduct = (productId: string) => {
    return products.find(
      (product) =>
        String(product.id) ===
        String(productId)
    );
  };

  /* =========================================================
     CANCEL ORDER
  ========================================================= */

  const openCancelModal = (order: Order) => {
    const trackingStatus = normalizeStatus(
      order.trackingStatus || "order_placed"
    );

    const cannotCancelAfterShipping = [
      "shipped",
      "in_transit",
      "out_for_delivery",
      "delivered",
    ];

    if (
      cannotCancelAfterShipping.includes(
        trackingStatus
      )
    ) {
      alert(
        "This order cannot be cancelled because it has already been shipped."
      );
      return;
    }

    setSelectedOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    if (!cancelReason) {
      alert(
        "Please select a cancellation reason."
      );
      return;
    }

    try {
      await cancelOrder({
        variables: {
          id: selectedOrder.id,
          cancellationReason: cancelReason,
        },
      });

      setShowCancelModal(false);
      setSelectedOrder(null);
      setCancelReason("");

      await refetchOrders();

      alert("Order cancelled successfully.");
    } catch (error: any) {
      console.error(
        "CANCEL ORDER ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to cancel the order."
      );
    }
  };

  /* =========================================================
     REVIEW
  ========================================================= */

  const openReview = (productId: string) => {
    setReviewMessage("");

    setReviewForm({
      productId,
      rating: 0,
      comment: "",
    });
  };

  const handleCreateReview = async () => {
    if (!reviewForm) return;

    if (reviewForm.rating < 1) {
      setReviewMessage(
        "Please select a rating."
      );
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewMessage(
        "Please write a review."
      );
      return;
    }

    try {
      await createReview({
        variables: {
          productId: reviewForm.productId,
          rating: reviewForm.rating,
          comment:
            reviewForm.comment.trim(),
        },
      });

      setReviewMessage(
        "Review submitted successfully!"
      );

      setTimeout(() => {
        setReviewForm(null);
        setReviewMessage("");
      }, 1200);
    } catch (error: any) {
      console.error(
        "CREATE REVIEW ERROR:",
        error
      );

      setReviewMessage(
        error?.message ||
          "Unable to submit review."
      );
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (ordersLoading) {
    return (
      <main className="min-h-screen bg-[#F8F9FB] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-600">
              Loading your orders...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (ordersError) {
    return (
      <main className="min-h-screen bg-[#F8F9FB] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="font-medium text-red-600">
              Unable to load your orders.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {ordersError.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F9FB] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#0B1F3A] text-3xl text-white">
              📦
            </div>

            <h1 className="text-2xl font-bold text-[#0B1F3A]">
              My Orders
            </h1>

            <p className="mt-3 text-gray-500">
              You don't have any orders yet.
            </p>

            <button
              onClick={() =>
                router.push("/shop")
              }
              className="mt-6 rounded-lg bg-[#0B1F3A] px-6 py-3 font-medium text-white transition hover:bg-[#142d4d]"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F8F9FB] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1F3A]">
            My Orders
          </h1>

          <p className="mt-2 text-gray-500">
            Track and manage your orders.
          </p>
        </div>

        {/* =====================================================
            ORDERS
        ===================================================== */}

        <div className="space-y-8">

          {orders.map((order) => {
            const normalizedOrderStatus =
              normalizeStatus(order.status);

            /*
             * Backend may still return "confirmed".
             *
             * Customer UI does not show Confirmed,
             * so Confirmed is treated as Order Placed.
             */
            const rawTrackingStatus =
              normalizeStatus(
                order.trackingStatus ||
                  "order_placed"
              );

            const trackingStatus =
              rawTrackingStatus === "confirmed"
                ? "order_placed"
                : rawTrackingStatus;

            /*
             * Current index for the customer-facing
             * six-stage timeline.
             */
            const currentTrackingIndex =
              trackingSteps.indexOf(
                trackingStatus
              );

            /*
             * Safety fallback.
             */
            const safeTrackingIndex =
              currentTrackingIndex >= 0
                ? currentTrackingIndex
                : 0;

            const isCancelled =
              normalizedOrderStatus ===
              "cancelled";

            const isDelivered =
              normalizedOrderStatus ===
                "delivered" ||
              trackingStatus ===
                "delivered";

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >

                {/* =================================================
                    ORDER HEADER
                ================================================= */}

                <div className="border-b border-gray-100 p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                      <p className="text-sm text-gray-500">
                        Order ID
                      </p>

                      <p className="mt-1 break-all font-semibold text-[#0B1F3A]">
                        #{order.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Order Date
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Payment
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {order.paymentMode ||
                          "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Total
                      </p>

                      <p className="mt-1 font-bold text-[#C9A227]">
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                  </div>
                </div>

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div className="border-b border-gray-100 p-5 md:p-6">
                  <h2 className="mb-4 text-lg font-semibold text-[#0B1F3A]">
                    Items
                  </h2>

                  <div className="space-y-4">

                    {order.items.map(
                      (item, index) => {
                        const product =
                          getProduct(
                            item.productId
                          );

                        return (
                          <div
                            key={`${item.productId}-${index}`}
                            className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >

                            <div className="flex items-center gap-4">

                              {product?.image ? (
                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.name ||
                                    "Product"
                                  }
                                  className="h-20 w-20 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                                  🛍️
                                </div>
                              )}

                              <div>
                                <h3 className="font-semibold text-[#0B1F3A]">
                                  {product?.name ||
                                    "Product"}
                                </h3>

                                {item.size && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Size:{" "}
                                    {item.size}
                                  </p>
                                )}

                                {item.colour && (
                                  <p className="text-sm text-gray-500">
                                    Colour:{" "}
                                    {item.colour}
                                  </p>
                                )}

                                <p className="text-sm text-gray-500">
                                  Quantity:{" "}
                                  {item.quantity}
                                </p>
                              </div>

                            </div>

                            <div className="text-left sm:text-right">

                              <p className="font-semibold text-[#0B1F3A]">
                                ₹
                                {Number(
                                  item.totalAmount ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              {isDelivered && (
                                <button
                                  onClick={() =>
                                    openReview(
                                      item.productId
                                    )
                                  }
                                  className="mt-2 rounded-lg border border-[#C9A227] px-3 py-1.5 text-sm font-medium text-[#C9A227] transition hover:bg-[#C9A227] hover:text-white"
                                >
                                  Write Review
                                </button>
                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                </div>

                {/* =================================================
                    DELIVERY TRACKING
                ================================================= */}

                {!isCancelled && (
                  <div className="border-b border-gray-100 p-5 md:p-6">

                    {/* TRACKING HEADER */}

                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-[#0B1F3A]">
                        Delivery Tracking
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Track the progress of your order.
                      </p>
                    </div>

                    {/* =================================================
                        VERTICAL TRACKING TIMELINE
                    ================================================= */}

                    <div className="rounded-xl border border-gray-100 bg-white p-5 md:p-6">

                      <div className="relative">

                        {trackingSteps.map(
                          (step, index) => {

                            /*
                             * Completed means this stage has
                             * already been reached.
                             */
                            const completed =
                              safeTrackingIndex >=
                              index;

                            /*
                             * Current means this is the
                             * exact current stage.
                             */
                            const current =
                              safeTrackingIndex ===
                              index;

                            /*
                             * Last item does not need
                             * a connecting line below it.
                             */
                            const isLast =
                              index ===
                              trackingSteps.length - 1;

                            /*
                             * Find this stage's history.
                             *
                             * Confirmed is intentionally
                             * ignored because it is not
                             * displayed to the customer.
                             */
                            const historyItem =
                              order.trackingHistory
                                ?.filter(
                                  (history) =>
                                    normalizeStatus(
                                      history.status
                                    ) !==
                                    "confirmed"
                                )
                                .find(
                                  (history) =>
                                    normalizeStatus(
                                      history.status
                                    ) === step
                                );

                            /*
                             * Default message when the
                             * backend does not have a
                             * history entry.
                             */
                            const stageMessage =
                              historyItem?.message ||
                              trackingMessages[
                                step
                              ];

                            return (
                              <div
                                key={step}
                                className="relative flex gap-4 md:gap-6"
                              >

                                {/* =================================================
                                    LEFT TIMELINE
                                ================================================= */}

                                <div className="relative flex w-8 shrink-0 justify-center">

                                  {/* CONNECTING LINE */}

                                  {!isLast && (
                                    <div
                                      className={`absolute left-1/2 top-8 w-0.5 -translate-x-1/2 transition-colors duration-300 ${
                                        safeTrackingIndex >
                                        index
                                          ? "bg-green-500"
                                          : "bg-gray-200"
                                      }`}
                                      style={{
                                        height:
                                          "calc(100% + 1.25rem)",
                                      }}
                                    />
                                  )}

                                  {/* CIRCLE */}

                                  <div
                                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                                      completed
                                        ? "border-green-500 bg-green-500 text-white"
                                        : "border-gray-300 bg-white text-gray-400"
                                    } ${
                                      current
                                        ? "ring-4 ring-green-500/20"
                                        : ""
                                    }`}
                                  >
                                    {completed
                                      ? "✓"
                                      : ""}
                                  </div>

                                </div>

                                {/* =================================================
                                    RIGHT INFORMATION
                                ================================================= */}

                                <div
                                  className={`min-w-0 flex-1 ${
                                    isLast
                                      ? "pb-0"
                                      : "pb-8"
                                  }`}
                                >

                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                                    <div>

                                      {/* STAGE NAME */}

                                      <h3
                                        className={`font-semibold ${
                                          current
                                            ? "text-green-600"
                                            : completed
                                            ? "text-[#0B1F3A]"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {formatTrackingStatus(
                                          step
                                        )}
                                      </h3>

                                      {/* MESSAGE */}

                                      {completed && (
                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                          {stageMessage}
                                        </p>
                                      )}

                                      {/* DATE */}

                                      {historyItem?.date && (
                                        <p className="mt-1 text-xs text-gray-400">
                                          {new Date(
                                            historyItem.date
                                          ).toLocaleString(
                                            "en-IN",
                                            {
                                              day: "2-digit",
                                              month:
                                                "short",
                                              year:
                                                "numeric",
                                              hour:
                                                "2-digit",
                                              minute:
                                                "2-digit",
                                            }
                                          )}
                                        </p>
                                      )}

                                    </div>

                                    {/* CURRENT STATUS */}

                                    {current && (
                                      <span className="mt-1 w-fit shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                                        Current Status
                                      </span>
                                    )}

                                  </div>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================================
                    CANCELLED
                ================================================= */}

                {isCancelled && (
                  <div className="border-b border-gray-100 p-5 md:p-6">

                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                      <h2 className="font-semibold text-red-700">
                        Order Cancelled
                      </h2>

                      {order.cancellationReason && (
                        <p className="mt-2 text-sm text-red-600">
                          <span className="font-medium">
                            Reason:
                          </span>{" "}
                          {order.cancellationReason}
                        </p>
                      )}

                      {order.cancellationDate && (
                        <p className="mt-1 text-sm text-red-500">
                          Cancelled on:{" "}
                          {new Date(
                            order.cancellationDate
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      )}

                    </div>

                  </div>
                )}

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">

                  <button
                    onClick={() =>
                      router.push("/shop")
                    }
                    className="rounded-lg border border-[#0B1F3A] px-5 py-2.5 font-medium text-[#0B1F3A] transition hover:bg-[#0B1F3A] hover:text-white"
                  >
                    Continue Shopping
                  </button>

                  {!isCancelled &&
                    !isDelivered &&
                    normalizedOrderStatus !==
                      "completed" && (
                      <button
                        onClick={() =>
                          openCancelModal(order)
                        }
                        className="rounded-lg border border-red-200 px-5 py-2.5 font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Cancel Order
                      </button>
                    )}

                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* =========================================================
          CANCEL MODAL
      ========================================================= */}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-bold text-[#0B1F3A]">
              Cancel Order
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please select a reason for cancelling
              your order.
            </p>

            <div className="mt-5 space-y-3">

              {[
                "Changed my mind",
                "Ordered by mistake",
                "Found a better price",
                "Delivery is taking too long",
                "Other",
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >

                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={
                      cancelReason ===
                      reason
                    }
                    onChange={(e) =>
                      setCancelReason(
                        e.target.value
                      )
                    }
                  />

                  <span className="text-sm text-gray-700">
                    {reason}
                  </span>

                </label>
              ))}

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrder(null);
                  setCancelReason("");
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700"
              >
                Keep Order
              </button>

              <button
                onClick={handleCancelOrder}
                disabled={
                  cancelling ||
                  !cancelReason
                }
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          REVIEW MODAL
      ========================================================= */}

      {reviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-bold text-[#0B1F3A]">
              Write a Review
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              How was your product?
            </p>

            {/* RATING */}

            <div className="mt-5 flex justify-center gap-2">

              {[1, 2, 3, 4, 5].map(
                (rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() =>
                      setReviewForm({
                        ...reviewForm,
                        rating,
                      })
                    }
                    className={`text-3xl transition ${
                      reviewForm.rating >=
                      rating
                        ? "scale-110"
                        : "opacity-40"
                    }`}
                  >
                    😊
                  </button>
                )
              )}

            </div>

            <p className="mt-2 text-center text-sm text-gray-500">
              {reviewForm.rating > 0
                ? `${reviewForm.rating}/5`
                : "Select a rating"}
            </p>

            {/* COMMENT */}

            <textarea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  comment: e.target.value,
                })
              }
              placeholder="Write your review..."
              rows={4}
              className="mt-5 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-[#C9A227]"
            />

            {reviewMessage && (
              <p
                className={`mt-3 text-center text-sm ${
                  reviewMessage.includes(
                    "successfully"
                  )
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {reviewMessage}
              </p>
            )}

            {/* ACTIONS */}

            <div className="mt-5 flex gap-3">

              <button
                onClick={() => {
                  setReviewForm(null);
                  setReviewMessage("");
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateReview}
                disabled={creatingReview}
                className="flex-1 rounded-lg bg-[#0B1F3A] px-4 py-2.5 font-medium text-white disabled:opacity-50"
              >
                {creatingReview
                  ? "Submitting..."
                  : "Submit Review"}
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}