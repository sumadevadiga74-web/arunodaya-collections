"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

type ProductImage = { url: string };
type Product = { id: string; name: string; images?: ProductImage[] };
type ReviewForm = { productId: string; rating: number; comment: string };

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
      trackingHistory { status message date }
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
        images { url }
      }
    }
  }
`;

const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder($id: ID!, $cancellationReason: String!) {
    cancelOrder(id: $id, cancellationReason: $cancellationReason) {
      id
      status
      cancellationReason
      cancellationDate
    }
  }
`;

const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($productId: ID!, $rating: Int!, $comment: String!) {
    createReview(productId: $productId, rating: $rating, comment: $comment) {
      id
      productId
      rating
      comment
    }
  }
`;

const trackingSteps = [
  "order_placed",
  "packed",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

const trackingMessages: Record<string, string> = {
  order_placed: "Your order has been received.",
  confirmed: "Your order has been confirmed and is being prepared.",
  packed: "Your order has been packed and is ready for dispatch.",
  shipped: "Your package has left our warehouse.",
  in_transit: "Your package is on the way.",
  out_for_delivery: "Your package is nearby and will be delivered soon.",
  delivered: "Your order has been delivered successfully.",
};

const normalizeStatus = (status?: string) => (status || "").toLowerCase().trim();

const formatTrackingStatus = (status: string) => {
  const labels: Record<string, string> = {
    order_placed: "Order Placed",
    confirmed: "Confirmed",
    packed: "Packed",
    shipped: "Shipped",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
  };
  return labels[normalizeStatus(status)] || "Order Placed";
};

const getStatusStyle = (value?: string) => {
  switch (normalizeStatus(value)) {
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "processing":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "completed":
    case "delivered":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "cancelled":
      return "bg-red-50 text-red-700 ring-red-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
};

const formatDate = (value?: string, withTime = false) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
};

const formatMoney = (value?: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function MyOrdersPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewForm, setReviewForm] = useState<ReviewForm | null>(null);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      router.replace("/customer-login");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      if (!user?.id) {
        router.replace("/customer-login");
        return;
      }
      setCurrentUserId(String(user.id));
    } catch {
      router.replace("/customer-login");
    }
  }, [router]);

  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery<any>(ORDERS_QUERY, {
    skip: !currentUserId,
    fetchPolicy: "network-only",
  });

  const { data: productsData } = useQuery<any>(PRODUCTS_QUERY, {
    fetchPolicy: "cache-first",
  });

  const [cancelOrder, { loading: cancelling }] = useMutation<any>(CANCEL_ORDER_MUTATION);
  const [createReview, { loading: creatingReview }] = useMutation<any>(CREATE_REVIEW_MUTATION);

  const allOrders: Order[] = ordersData?.orders || [];
  const orders = allOrders.filter((order) => String(order.userId) === String(currentUserId));
  const products: Product[] = productsData?.products?.products || [];

  const getProduct = (productId: string) =>
    products.find((product) => String(product.id) === String(productId));

  const openCancelModal = (order: Order) => {
    const trackingStatus = normalizeStatus(order.trackingStatus || "order_placed");
    if (["shipped", "in_transit", "out_for_delivery", "delivered"].includes(trackingStatus)) {
      window.alert("This order cannot be cancelled because it has already been shipped.");
      return;
    }
    if (normalizeStatus(order.status) === "cancelled") {
      window.alert("This order has already been cancelled.");
      return;
    }
    setSelectedOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!cancelReason) {
      window.alert("Please select a cancellation reason.");
      return;
    }
    try {
      await cancelOrder({
        variables: { id: selectedOrder.id, cancellationReason: cancelReason },
      });
      setShowCancelModal(false);
      setSelectedOrder(null);
      setCancelReason("");
      await refetchOrders();
      window.alert("Order cancelled successfully.");
    } catch (error: any) {
      console.error("CANCEL ORDER ERROR:", error);
      window.alert(error?.message || "Unable to cancel the order.");
    }
  };

  const openReview = (productId: string) => {
    setReviewMessage("");
    setReviewForm({ productId, rating: 0, comment: "" });
  };

  const handleCreateReview = async () => {
    if (!reviewForm) return;
    if (reviewForm.rating < 1) {
      setReviewMessage("Please select a rating.");
      return;
    }
    if (!reviewForm.comment.trim()) {
      setReviewMessage("Please write a review.");
      return;
    }
    try {
      await createReview({
        variables: {
          productId: reviewForm.productId,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        },
      });
      setReviewMessage("Review submitted successfully!");
      window.setTimeout(() => {
        setReviewForm(null);
        setReviewMessage("");
      }, 1200);
    } catch (error: any) {
      console.error("CREATE REVIEW ERROR:", error);
      setReviewMessage(error?.message || "Unable to submit review.");
    }
  };

  const pageShell = "min-h-screen bg-[#f6f7fb] px-4 py-7 sm:px-6 sm:py-10";
  const panel = "rounded-2xl border border-slate-200 bg-white shadow-sm";

  if (!currentUserId && !ordersError) {
    return (
      <main className={pageShell}>
        <div className="mx-auto max-w-5xl">
          <div className={`${panel} p-10 text-center`}>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            <p className="text-sm font-medium text-slate-600">Preparing your orders...</p>
          </div>
        </div>
      </main>
    );
  }

  if (ordersLoading) {
    return (
      <main className={pageShell}>
        <div className="mx-auto max-w-5xl">
          <div className={`${panel} p-10 text-center`}>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            <p className="font-medium text-slate-600">Loading your orders...</p>
          </div>
        </div>
      </main>
    );
  }

  if (ordersError) {
    return (
      <main className={pageShell}>
        <div className="mx-auto max-w-5xl">
          <div className={`${panel} p-7 sm:p-10`}>
            <p className="font-semibold text-red-700">Unable to load your orders.</p>
            <p className="mt-2 break-words text-sm leading-6 text-slate-500">{ordersError.message}</p>
            <button onClick={() => refetchOrders()} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={pageShell}>
      <div className="mx-auto max-w-5xl">
        <header className={`${panel} relative mb-6 overflow-hidden p-6 sm:p-8`}>
          <div className="absolute inset-y-0 left-0 w-1.5 bg-amber-500" />
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Arunodaya Collections</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">My Orders</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">Track deliveries, review purchases, and manage your orders.</p>
            </div>
            <div className="w-fit rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-medium text-slate-500">Total orders</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900">{orders.length}</p>
            </div>
          </div>
        </header>

        {orders.length === 0 ? (
          <section className={`${panel} px-6 py-12 text-center sm:px-10`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-3xl text-white">📦</div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">No orders yet</h2>
            <p className="mt-2 text-sm text-slate-500">Your orders will appear here once you place your first order.</p>
            <button onClick={() => router.push("/shop")} className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
              Continue Shopping
            </button>
          </section>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderStatus = normalizeStatus(order.status);
              const rawTrackingStatus = normalizeStatus(order.trackingStatus || "order_placed");
              const trackingStatus = rawTrackingStatus === "confirmed" ? "order_placed" : rawTrackingStatus;
              const index = trackingSteps.indexOf(trackingStatus);
              const safeTrackingIndex = index >= 0 ? index : 0;
              const isCancelled = orderStatus === "cancelled";
              const isDelivered = orderStatus === "delivered" || trackingStatus === "delivered";
              const isExpanded = expandedOrderId === order.id;

              return (
                <article key={order.id} className={`${panel} overflow-hidden transition-shadow hover:shadow-md`}>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order ID</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(order.status)}`}>
                            {(order.status || "pending").replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-800">#{order.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        aria-expanded={isExpanded}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                        <span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span>
                      </button>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3 lg:grid-cols-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500">Order date</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Payment</p>
                        <p className="mt-1 text-sm font-semibold uppercase text-slate-800">{order.paymentMode || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Total</p>
                        <p className="mt-1 text-lg font-bold text-slate-950">{formatMoney(order.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Items</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0} item(s)</p>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      <section className="border-t border-slate-100 p-5 sm:p-6">
                        <h2 className="mb-4 text-base font-bold text-slate-900">Items in this order</h2>
                        <div className="space-y-3">
                          {(order.items || []).map((item, itemIndex) => {
                            const product = getProduct(item.productId);
                            return (
                              <div key={`${item.productId}-${itemIndex}`} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                                <div className="flex min-w-0 items-center gap-4">
                                  {product?.images?.[0]?.url ? (
                                    <img src={product.images[0].url} alt={product.name || "Product"} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 bg-white object-cover sm:h-24 sm:w-24" />
                                  ) : (
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 sm:h-24 sm:w-24">No image</div>
                                  )}
                                  <div className="min-w-0">
                                    <h3 className="font-semibold text-slate-900">{product?.name || "Product"}</h3>
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                                      {item.size && <span>Size: {item.size}</span>}
                                      {item.colour && <span>Colour: {item.colour}</span>}
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                                  <p className="font-bold text-slate-900">{formatMoney(item.totalAmount)}</p>
                                  {isDelivered && (
                                    <button type="button" onClick={() => openReview(item.productId)} className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300">
                                      Write Review
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      {!isCancelled && (
                        <section className="border-t border-slate-100 p-5 sm:p-6">
                          <div className="mb-5">
                            <h2 className="text-base font-bold text-slate-900">Delivery tracking</h2>
                            <p className="mt-1 text-sm text-slate-500">Follow your order from placement to delivery.</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4 sm:p-6">
                            <div className="space-y-0">
                              {trackingSteps.map((step, stepIndex) => {
                                const completed = safeTrackingIndex >= stepIndex;
                                const current = safeTrackingIndex === stepIndex;
                                const historyItem = order.trackingHistory
                                  ?.filter((history) => normalizeStatus(history.status) !== "confirmed")
                                  .find((history) => normalizeStatus(history.status) === step);
                                const message = historyItem?.message || trackingMessages[step];
                                const last = stepIndex === trackingSteps.length - 1;
                                return (
                                  <div key={step} className="flex gap-4">
                                    <div className="relative flex w-8 shrink-0 justify-center">
                                      {!last && <span className={`absolute top-8 h-full w-0.5 ${safeTrackingIndex > stepIndex ? "bg-emerald-500" : "bg-slate-200"}`} />}
                                      <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-slate-400"} ${current ? "ring-4 ring-emerald-100" : ""}`}>
                                        {completed ? "✓" : ""}
                                      </span>
                                    </div>
                                    <div className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-7"}`}>
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                          <h3 className={`font-semibold ${current ? "text-emerald-700" : completed ? "text-slate-900" : "text-slate-400"}`}>{formatTrackingStatus(step)}</h3>
                                          {completed && <p className="mt-1 text-sm leading-6 text-slate-500">{message}</p>}
                                          {historyItem?.date && <p className="mt-1 text-xs text-slate-400">{formatDate(historyItem.date, true)}</p>}
                                        </div>
                                        {current && <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Current status</span>}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </section>
                      )}

                      {isCancelled && (
                        <section className="border-t border-red-100 p-5 sm:p-6">
                          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
                            <h2 className="font-bold text-red-800">Order cancelled</h2>
                            {order.cancellationReason && <p className="mt-2 text-sm leading-6 text-red-700"><span className="font-semibold">Reason:</span> {order.cancellationReason}</p>}
                            {order.cancellationDate && <p className="mt-2 text-sm text-red-600">Cancelled on: {formatDate(order.cancellationDate, true)}</p>}
                          </div>
                        </section>
                      )}

                      <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <button type="button" onClick={() => router.push("/shop")} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                          Continue Shopping
                        </button>
                        {!isCancelled && !isDelivered && orderStatus !== "completed" && (
                          <button type="button" onClick={() => openCancelModal(order)} className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200">
                            Cancel Order
                          </button>
                        )}
                      </footer>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-order-title" className="my-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
            <h2 id="cancel-order-title" className="text-xl font-bold tracking-tight text-slate-900">Cancel order</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Please select a reason for cancelling your order.</p>
            <div className="mt-5 space-y-2">
              {["Changed my mind", "Ordered by mistake", "Found a better price", "Delivery is taking too long", "Other"].map((reason) => (
                <label key={reason} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${cancelReason === reason ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:bg-slate-50"}`}>
                  <input type="radio" name="cancelReason" value={reason} checked={cancelReason === reason} onChange={(event) => setCancelReason(event.target.value)} className="accent-slate-900" />
                  <span className="text-sm text-slate-700">{reason}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={() => { setShowCancelModal(false); setSelectedOrder(null); setCancelReason(""); }} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Keep order
              </button>
              <button type="button" onClick={handleCancelOrder} disabled={cancelling || !cancelReason} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                {cancelling ? "Cancelling..." : "Confirm cancellation"}
              </button>
            </div>
          </section>
        </div>
      )}

      {reviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="review-title" className="my-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
            <h2 id="review-title" className="text-xl font-bold tracking-tight text-slate-900">Write a review</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">How was your product?</p>
            <div className="mt-5 flex justify-center gap-2" role="group" aria-label="Rating from 1 to 5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button key={rating} type="button" aria-label={`${rating} star${rating === 1 ? "" : "s"}`} aria-pressed={reviewForm.rating === rating} onClick={() => setReviewForm({ ...reviewForm, rating })} className={`text-3xl transition hover:scale-110 ${reviewForm.rating >= rating ? "text-amber-400" : "text-slate-300"}`}>
                  ★
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-sm text-slate-500">{reviewForm.rating > 0 ? `${reviewForm.rating}/5` : "Select a rating"}</p>
            <textarea value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} placeholder="Write your review..." rows={4} className="mt-5 w-full resize-y rounded-xl border border-slate-300 p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
            {reviewMessage && <p role="status" className={`mt-3 text-center text-sm ${reviewMessage.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{reviewMessage}</p>}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={() => { setReviewForm(null); setReviewMessage(""); }} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Close</button>
              <button type="button" onClick={handleCreateReview} disabled={creatingReview} className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                {creatingReview ? "Submitting..." : "Submit review"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
