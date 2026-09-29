"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

/* =========================================================
   ORDERS QUERY
========================================================= */

const ORDERS_QUERY = gql`
  query Orders {
    orders {
      id
      userId

      customer {
        id
        name
        email
        phone
      }

      items {
        productId
        productName
        productImage
        productPrice
        quantity
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
      updatedAt

      cancellationReason
      cancellationDate
    }
  }
`;

/* =========================================================
   CREATE ORDER
========================================================= */

const CREATE_ORDER = gql`
  mutation CreateOrder(
    $userId: String!
    $items: [OrderItemInput!]!
    $totalAmount: Float!
    $paymentMode: String
    $status: String
  ) {
    createOrder(
      userId: $userId
      items: $items
      totalAmount: $totalAmount
      paymentMode: $paymentMode
      status: $status
    ) {
      id
      userId

      items {
        productId
        quantity
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
      updatedAt
    }
  }
`;

/* =========================================================
   UPDATE ORDER
========================================================= */

const UPDATE_ORDER = gql`
  mutation UpdateOrder(
    $id: ID!
    $userId: String
    $items: [OrderItemInput!]
    $totalAmount: Float
    $paymentMode: String
    $status: String
  ) {
    updateOrder(
      id: $id
      userId: $userId
      items: $items
      totalAmount: $totalAmount
      paymentMode: $paymentMode
      status: $status
    ) {
      id
      userId

      items {
        productId
        quantity
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
      updatedAt
    }
  }
`;

/* =========================================================
   UPDATE DELIVERY TRACKING
========================================================= */

const UPDATE_ORDER_TRACKING = gql`
  mutation UpdateOrderTracking(
    $id: ID!
    $trackingStatus: String!
  ) {
    updateOrderTracking(
      id: $id
      trackingStatus: $trackingStatus
    ) {
      id
      status
      trackingStatus

      trackingHistory {
        status
        message
        date
      }
    }
  }
`;

/* =========================================================
   DELETE ORDER
========================================================= */

const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id) {
      id
    }
  }
`;

/* =========================================================
   TYPES
========================================================= */

type TrackingHistoryItem = {
  status: string;
  message?: string;
  date?: string;
};

type OrderItem = {
  productId: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  quantity: number;
  totalAmount: number;
};

type OrderCustomer = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
};

type Order = {
  id: string;
  userId: string;
  customer?: OrderCustomer | null;
  items: OrderItem[];
  totalAmount: number;
  paymentMode?: string;
  status?: string;

  trackingStatus?: string;

  trackingHistory?: TrackingHistoryItem[];

  createdAt?: string;
  updatedAt?: string;

  cancellationReason?: string;
  cancellationDate?: string;
};

type FilterStatus =
  | "all"
  | "pending"
  | "processing"
  | "completed"
  | "delivered"
  | "cancelled";

/* =========================================================
   COMPONENT
========================================================= */

export default function Orders() {
  /* =======================================================
     ORDERS QUERY
  ======================================================= */

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<{ orders: Order[] }>(ORDERS_QUERY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createOrder] = useMutation(CREATE_ORDER);

  const [updateOrder] =
    useMutation(UPDATE_ORDER);

  const [updateOrderTracking] =
    useMutation(UPDATE_ORDER_TRACKING);

  const [deleteOrder] =
    useMutation(DELETE_ORDER);

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [selectedOrderId, setSelectedOrderId] =
    useState<string | null>(null);

  const [userId, setUserId] =
    useState("");

  const [productId, setProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState("1");

  const [totalAmount, setTotalAmount] =
    useState("");

  const [paymentMode, setPaymentMode] =
    useState("COD");

  const [status, setStatus] =
    useState("pending");

  const [filterStatus, setFilterStatus] =
    useState<FilterStatus>("all");

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setEditingId(null);
    setUserId("");
    setProductId("");
    setQuantity("1");
    setTotalAmount("");
    setPaymentMode("COD");
    setStatus("pending");
  };

  /* =======================================================
     CREATE / UPDATE ORDER
  ======================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!userId || !productId || !totalAmount) {
      alert(
        "User ID, Product ID and Total Amount are required"
      );
      return;
    }

    const item = {
      productId,
      quantity: Number(quantity),
      totalAmount: Number(totalAmount),
    };

    try {
      /* =================================================
         UPDATE EXISTING ORDER
      ================================================= */

      if (editingId) {
        const result =
          await updateOrder({
            variables: {
              id: editingId,
              userId,
              items: [item],
              totalAmount:
                Number(totalAmount),
              paymentMode,
              status,
            },

            refetchQueries: [
              {
                query: ORDERS_QUERY,
              },
            ],

            awaitRefetchQueries: true,
          });

        if (!result.data?.updateOrder) {
          throw new Error(
            "Order update returned no data."
          );
        }

        alert(
          "Order updated successfully"
        );

        resetForm();

        await refetch({
          fetchPolicy:
            "network-only",
        });
      }

      /* =================================================
         CREATE NEW ORDER
      ================================================= */

      else {
        const result =
          await createOrder({
            variables: {
              userId,
              items: [item],
              totalAmount:
                Number(totalAmount),
              paymentMode,
              status,
            },

            refetchQueries: [
              {
                query: ORDERS_QUERY,
              },
            ],

            awaitRefetchQueries: true,
          });

        if (!result.data?.createOrder) {
          throw new Error(
            "Order creation returned no data."
          );
        }

        alert(
          "Order created successfully"
        );

        resetForm();

        await refetch({
          fetchPolicy:
            "network-only",
        });
      }
    } catch (err: any) {
      console.error(
        "ORDER OPERATION ERROR:",
        err
      );

      alert(
        err?.message ||
          "Operation failed"
      );
    }
  };

  /* =======================================================
     EDIT ORDER
  ======================================================= */

  const handleEdit = (
    order: Order
  ) => {
    const firstItem =
      order.items?.[0];

    setEditingId(order.id);

    setUserId(order.userId);

    setProductId(
      firstItem?.productId || ""
    );

    setQuantity(
      String(
        firstItem?.quantity || 1
      )
    );

    setTotalAmount(
      String(
        firstItem?.totalAmount ||
          order.totalAmount ||
          ""
      )
    );

    setPaymentMode(
      order.paymentMode || "COD"
    );

    setStatus(
      order.status || "pending"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     DELETE ORDER
  ======================================================= */

  const handleDelete = async (
    id: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to delete this order?"
      )
    ) {
      return;
    }

    try {
      const result =
        await deleteOrder({
          variables: {
            id,
          },

          refetchQueries: [
            {
              query: ORDERS_QUERY,
            },
          ],

          awaitRefetchQueries: true,
        });

      if (!result.data?.deleteOrder) {
        throw new Error(
          "Order deletion returned no data."
        );
      }

      if (
        selectedOrderId === id
      ) {
        setSelectedOrderId(null);
      }

      if (editingId === id) {
        resetForm();
      }

      alert(
        "Order deleted successfully"
      );

      await refetch({
        fetchPolicy:
          "network-only",
      });
    } catch (err: any) {
      console.error(
        "DELETE ORDER ERROR:",
        err
      );

      alert(
        err?.message ||
          "Delete failed"
      );
    }
  };

  /* =======================================================
     CHANGE ORDER STATUS
  ======================================================= */

  const handleStatusChange =
    async (
      order: Order,
      newStatus: string
    ) => {
      try {
        const result =
          await updateOrder({
            variables: {
              id: order.id,
              status: newStatus,
            },

            refetchQueries: [
              {
                query: ORDERS_QUERY,
              },
            ],

            awaitRefetchQueries: true,
          });

        const updatedOrder =
          result.data?.updateOrder;

        if (!updatedOrder) {
          throw new Error(
            "Order update returned no data."
          );
        }

        alert(
          `Order status updated to "${updatedOrder.status}".`
        );

        await refetch({
          fetchPolicy:
            "network-only",
        });
      } catch (err: any) {
        console.error(
          "UPDATE ORDER STATUS ERROR:",
          err
        );

        alert(
          err?.message ||
            "Failed to update order status."
        );

        await refetch({
          fetchPolicy:
            "network-only",
        });
      }
    };

  /* =======================================================
     CHANGE DELIVERY TRACKING
  ======================================================= */

  const handleTrackingChange =
    async (
      order: Order,
      newTrackingStatus: string
    ) => {
      try {
        const result =
          await updateOrderTracking({
            variables: {
              id: order.id,
              trackingStatus:
                newTrackingStatus,
            },

            refetchQueries: [
              {
                query: ORDERS_QUERY,
              },
            ],

            awaitRefetchQueries: true,
          });

        const updatedOrder =
          result.data
            ?.updateOrderTracking;

        if (!updatedOrder) {
          throw new Error(
            "Tracking update returned no data."
          );
        }

        alert(
          `Delivery tracking updated to "${formatTrackingStatus(
            newTrackingStatus
          )}".`
        );

        await refetch({
          fetchPolicy:
            "network-only",
        });
      } catch (err: any) {
        console.error(
          "UPDATE TRACKING ERROR:",
          err
        );

        alert(
          err?.message ||
            "Failed to update delivery tracking."
        );

        await refetch({
          fetchPolicy:
            "network-only",
        });
      }
    };

  /* =======================================================
     STATUS STYLE
  ======================================================= */

  const getStatusStyle = (
    value?: string
  ) => {
    switch (value?.toLowerCase()) {
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

  /* =======================================================
     FORMAT STATUS
  ======================================================= */

  const formatStatus = (
    value?: string
  ) => {
    if (!value) {
      return "Pending";
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  };

  /* =======================================================
     FORMAT TRACKING STATUS
  ======================================================= */

  const formatTrackingStatus = (
    value?: string
  ) => {
    if (!value) {
      return "Order Placed";
    }

    const labels: Record<
      string,
      string
    > = {
      order_placed:
        "Order Placed",

      confirmed:
        "Confirmed",

      packed:
        "Packed",

      shipped:
        "Shipped",

      in_transit:
        "In Transit",

      out_for_delivery:
        "Out for Delivery",

      delivered:
        "Delivered",
    };

    return (
      labels[value] ||
      value
        .split("_")
        .map(
          (word) =>
            word
              .charAt(0)
              .toUpperCase() +
            word.slice(1)
        )
        .join(" ")
    );
  };

  /* =======================================================
     TRACKING STYLE
  ======================================================= */

  const getTrackingStyle = (
    value?: string
  ) => {
    switch (value) {
      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "packed":
        return "bg-purple-100 text-purple-700";

      case "shipped":
        return "bg-indigo-100 text-indigo-700";

      case "in_transit":
        return "bg-orange-100 text-orange-700";

      case "out_for_delivery":
        return "bg-yellow-100 text-yellow-700";

      case "delivered":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    value?: string
  ) => {
    if (!value) {
      return "Date unavailable";
    }

    const timestamp =
      Number(value);

    if (
      !Number.isNaN(timestamp)
    ) {
      const date =
        new Date(timestamp);

      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {
        return date.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        );
      }
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =======================================================
     TRACKING STEPS
  ======================================================= */

  const trackingSteps = [
    {
      number: 1,
      value: "order_placed",
      label: "Order Placed",
      description:
        "Order has been received",
    },

    {
      number: 2,
      value: "confirmed",
      label: "Confirmed",
      description:
        "Order has been confirmed",
    },

    {
      number: 3,
      value: "packed",
      label: "Packed",
      description:
        "Order is packed and ready",
    },

    {
      number: 4,
      value: "shipped",
      label: "Shipped",
      description:
        "Package left our warehouse",
    },

    {
      number: 5,
      value: "in_transit",
      label: "In Transit",
      description:
        "Package is on the way",
    },

    {
      number: 6,
      value: "out_for_delivery",
      label: "Out for Delivery",
      description:
        "Package is nearby",
    },

    {
      number: 7,
      value: "delivered",
      label: "Delivered",
      description:
        "Order delivered successfully",
    },
  ];

  /* =======================================================
     GET TRACKING STEP NUMBER
  ======================================================= */

  const getTrackingStep = (
    value?: string
  ) => {
    const index =
      trackingSteps.findIndex(
        (step) =>
          step.value ===
          (value ||
            "order_placed")
      );

    return index === -1
      ? 1
      : index + 1;
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading orders...
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-700">
            Error loading orders
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ORDERS
  ======================================================= */

  const orders =
    data?.orders ?? [];

  /* =======================================================
     STATUS COUNTS
  ======================================================= */

  const pendingOrders =
    orders.filter(
      (order) =>
        (
          order.status ||
          "pending"
        ).toLowerCase() ===
        "pending"
    ).length;

  const processingOrders =
    orders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        "processing"
    ).length;

  const completedOrders =
    orders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        "completed"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        "delivered"
    ).length;

  const cancelledOrders =
    orders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        "cancelled"
    ).length;

  /* =======================================================
     FILTERED ORDERS
  ======================================================= */

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter(
          (order) =>
            (
              order.status ||
              "pending"
            ).toLowerCase() ===
            filterStatus
        );

  /* =======================================================
     SELECTED ORDER
  ======================================================= */

  const selectedOrder =
    orders.find(
      (order) =>
        order.id ===
        selectedOrderId
    );

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="p-6">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Orders
        </h1>

        <p className="mt-1 text-gray-500">
          Manage customer orders
        </p>
      </div>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

        <button
          type="button"
          onClick={() =>
            setFilterStatus("all")
          }
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow ${
            filterStatus === "all"
              ? "border-black"
              : ""
          }`}
        >
          <p className="text-sm text-gray-500">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orders.length}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setFilterStatus("pending")
          }
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow ${
            filterStatus === "pending"
              ? "border-yellow-500"
              : ""
          }`}
        >
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingOrders}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setFilterStatus(
              "processing"
            )
          }
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow ${
            filterStatus ===
            "processing"
              ? "border-blue-500"
              : ""
          }`}
        >
          <p className="text-sm text-gray-500">
            Processing
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {processingOrders}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setFilterStatus(
              "completed"
            )
          }
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow ${
            filterStatus ===
            "completed"
              ? "border-green-500"
              : ""
          }`}
        >
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {completedOrders}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setFilterStatus(
              "delivered"
            )
          }
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow ${
            filterStatus ===
            "delivered"
              ? "border-emerald-500"
              : ""
          }`}
        >
          <p className="text-sm text-gray-500">
            Delivered
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {deliveredOrders}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setFilterStatus(
              "cancelled"
            )
          }
          className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow ${
            filterStatus ===
            "cancelled"
              ? "border-red-500"
              : ""
          }`}
        >
          <p className="text-sm text-gray-500">
            Cancelled
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {cancelledOrders}
          </p>
        </button>
      </div>

      {/* ===================================================
          ADD / EDIT FORM
      =================================================== */}

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-xl font-semibold">
              {editingId
                ? "Edit Order"
                : "Add Order"}
            </h2>

            <p className="text-sm text-gray-500">
              {editingId
                ? "Update the selected order"
                : "Create a new customer order"}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="w-fit rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <div>
            <label className="mb-1 block text-sm font-medium">
              Customer
            </label>

            <input
              className="w-full rounded-lg border p-3 outline-none focus:border-black"
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) =>
                setUserId(
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Product ID
            </label>

            <input
              className="w-full rounded-lg border p-3 outline-none focus:border-black"
              placeholder="Enter product ID"
              value={productId}
              onChange={(e) =>
                setProductId(
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Quantity
            </label>

            <input
              className="w-full rounded-lg border p-3 outline-none focus:border-black"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Total Amount
            </label>

            <input
              className="w-full rounded-lg border p-3 outline-none focus:border-black"
              type="number"
              min="0"
              step="0.01"
              placeholder="Total amount"
              value={totalAmount}
              onChange={(e) =>
                setTotalAmount(
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Payment Mode
            </label>

            <select
              className="w-full rounded-lg border p-3 outline-none focus:border-black"
              value={paymentMode}
              onChange={(e) =>
                setPaymentMode(
                  e.target.value
                )
              }
            >
              <option value="COD">
                Cash on Delivery
              </option>

              <option value="Online">
                Online Payment
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Status
            </label>

            <select
              className="w-full rounded-lg border p-3 outline-none focus:border-black"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >
              <option value="pending">
                Pending
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <button
            type="submit"
            className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
          >
            {editingId
              ? "Update Order"
              : "Add Order"}
          </button>
        </div>
      </form>

      {/* ===================================================
          FILTER BUTTONS
      =================================================== */}

      <div className="mb-4 flex flex-wrap items-center gap-2">

        <span className="mr-2 text-sm font-medium text-gray-500">
          Filter:
        </span>

        {(
          [
            "all",
            "pending",
            "processing",
            "completed",
            "delivered",
            "cancelled",
          ] as FilterStatus[]
        ).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() =>
              setFilterStatus(
                filter
              )
            }
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filterStatus === filter
                ? "bg-black text-white"
                : "border bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {filter === "all"
              ? "All"
              : formatStatus(filter)}
          </button>
        ))}
      </div>

      {/* ===================================================
          NO ORDERS
      =================================================== */}

      {filteredOrders.length ===
      0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">

          <div className="text-4xl">
            📦
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            No orders found
          </h2>

          <p className="mt-2 text-gray-500">
            There are no orders matching this filter.
          </p>
        </div>
      ) : (

        /* =================================================
           ORDERS TABLE
        ================================================= */

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1450px] text-left">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="p-4 text-sm font-semibold">
                    Order ID
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Customer
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Products
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Quantity
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Total
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Payment
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Status
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Delivery Tracking
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Date
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredOrders.map(
                  (order) => (

                    <tr
                      key={order.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      {/* ORDER ID */}

                      <td className="max-w-[170px] p-4">

                        <p
                          className="truncate text-sm font-medium"
                          title={order.id}
                        >
                          {order.id}
                        </p>

                      </td>

                      {/* CUSTOMER */}

                      <td className="max-w-[200px] p-4">

                        {order.customer ? (

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-gray-800">
                              {order.customer.name ||
                                "Unknown Customer"}
                            </p>

                            <p
                              className="truncate text-xs text-gray-500"
                              title={
                                order.customer.email ||
                                ""
                              }
                            >
                              {order.customer.email ||
                                "No email"}
                            </p>

                            {order.customer.phone && (
                              <p className="truncate text-xs text-gray-400">
                                {
                                  order.customer.phone
                                }
                              </p>
                            )}

                          </div>

                        ) : (

                          <div className="min-w-0">

                            <p className="text-sm text-gray-500">
                              Unknown Customer
                            </p>

                            <p
                              className="truncate text-xs text-gray-400"
                              title={order.userId}
                            >
                              ID: {order.userId}
                            </p>

                          </div>
                        )}

                      </td>

                      {/* PRODUCTS */}

                      <td className="max-w-[260px] p-4">

                        <div className="space-y-2">

                          {order.items?.map(
                            (
                              item,
                              index
                            ) => (

                              <div
                                key={`${item.productId}-${index}`}
                                className="flex items-center gap-3"
                              >

                                {item.productImage ? (

                                  <img
                                    src={
                                      item.productImage
                                    }
                                    alt={
                                      item.productName ||
                                      "Product"
                                    }
                                    className="h-12 w-12 rounded-lg border object-cover"
                                  />

                                ) : (

                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-gray-100 text-xs text-gray-400">
                                    No Image
                                  </div>

                                )}

                                <div className="min-w-0">

                                  <p
                                    className="truncate text-sm font-semibold text-gray-800"
                                    title={
                                      item.productName ||
                                      "Unknown Product"
                                    }
                                  >
                                    {item.productName ||
                                      "Unknown Product"}
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    ₹
                                    {item.productPrice ??
                                      0}{" "}
                                    ×{" "}
                                    {
                                      item.quantity
                                    }
                                  </p>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </td>

                      {/* QUANTITY */}

                      <td className="p-4 text-sm">

                        {order.items?.reduce(
                          (
                            sum,
                            item
                          ) =>
                            sum +
                            item.quantity,
                          0
                        )}

                      </td>

                      {/* TOTAL */}

                      <td className="p-4 text-sm font-semibold">
                        ₹
                        {
                          order.totalAmount
                        }
                      </td>

                      {/* PAYMENT */}

                      <td className="p-4 text-sm">
                        {
                          order.paymentMode ||
                          "COD"
                        }
                      </td>

                      {/* STATUS */}

                      <td className="p-4">

                        <select
                          value={
                            order.status ||
                            "pending"
                          }
                          onChange={(e) =>
                            handleStatusChange(
                              order,
                              e.target.value
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${getStatusStyle(
                            order.status
                          )}`}
                        >

                          <option value="pending">
                            Pending
                          </option>

                          <option value="processing">
                            Processing
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>

                        </select>

                      </td>

                      {/* DELIVERY TRACKING */}

                      <td className="p-4">

                        <select
                          value={
                            order.trackingStatus ||
                            "order_placed"
                          }
                          onChange={(e) =>
                            handleTrackingChange(
                              order,
                              e.target.value
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${getTrackingStyle(
                            order.trackingStatus
                          )}`}
                        >

                          <option value="order_placed">
                            Order Placed
                          </option>

                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="packed">
                            Packed
                          </option>

                          <option value="shipped">
                            Shipped
                          </option>

                          <option value="in_transit">
                            In Transit
                          </option>

                          <option value="out_for_delivery">
                            Out for Delivery
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                        </select>

                      </td>

                      {/* DATE */}

                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="p-4">

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrderId(
                                order.id
                              )
                            }
                            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                order
                              )
                            }
                            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                order.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          <div className="border-t bg-gray-50 px-4 py-3 text-sm text-gray-500">

            Showing{" "}

            <span className="font-semibold text-gray-700">
              {
                filteredOrders.length
              }
            </span>

            {" "}of{" "}

            <span className="font-semibold text-gray-700">
              {orders.length}
            </span>

            {" "}orders

          </div>

        </div>
      )}

      {/* ===================================================
          ORDER DETAILS MODAL
      =================================================== */}

      {selectedOrder && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b p-6">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Order Details
                </p>

                <h2 className="mt-1 break-all text-xl font-bold">
                  {
                    selectedOrder.id
                  }
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrderId(
                    null
                  )
                }
                className="rounded-full border px-3 py-1 text-lg hover:bg-gray-100"
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-6">

              <div className="grid gap-4 sm:grid-cols-2">

                {/* CUSTOMER */}

                <div className="rounded-xl border p-4">

                  <p className="text-sm text-gray-500">
                    Customer
                  </p>

                  {selectedOrder.customer ? (

                    <div className="mt-2 space-y-1">

                      <p className="font-semibold text-gray-800">
                        {
                          selectedOrder.customer.name ||
                          "Unknown Customer"
                        }
                      </p>

                      {selectedOrder.customer.email && (
                        <p className="text-sm text-gray-600">
                          {
                            selectedOrder.customer.email
                          }
                        </p>
                      )}

                      {selectedOrder.customer.phone && (
                        <p className="text-sm text-gray-500">
                          {
                            selectedOrder.customer.phone
                          }
                        </p>
                      )}

                    </div>

                  ) : (

                    <div className="mt-2">

                      <p className="font-semibold text-gray-600">
                        Unknown Customer
                      </p>

                      <p className="mt-1 break-all text-xs text-gray-400">
                        User ID:{" "}
                        {
                          selectedOrder.userId
                        }
                      </p>

                    </div>

                  )}

                </div>

                {/* PAYMENT */}

                <div className="rounded-xl border p-4">

                  <p className="text-sm text-gray-500">
                    Payment Mode
                  </p>

                  <p className="mt-1 font-semibold">
                    {
                      selectedOrder.paymentMode ||
                      "COD"
                    }
                  </p>

                </div>

                {/* PRODUCTS */}

                <div className="rounded-xl border p-4 sm:col-span-2">

                  <p className="text-sm text-gray-500">
                    Products
                  </p>

                  <div className="mt-3 space-y-3">

                    {selectedOrder.items?.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          key={`${item.productId}-${index}`}
                          className="flex gap-4 rounded-lg bg-gray-50 p-4"
                        >

                          {item.productImage ? (

                            <img
                              src={
                                item.productImage
                              }
                              alt={
                                item.productName ||
                                "Product"
                              }
                              className="h-20 w-20 shrink-0 rounded-lg border object-cover"
                            />

                          ) : (

                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-white text-xs text-gray-400">
                              No Image
                            </div>

                          )}

                          <div className="min-w-0 flex-1">

                            <p
                              className="font-semibold text-gray-800"
                              title={
                                item.productName ||
                                "Unknown Product"
                              }
                            >
                              {
                                item.productName ||
                                "Unknown Product"
                              }
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              Price: ₹
                              {
                                item.productPrice ??
                                0
                              }
                            </p>

                            <div className="mt-2 grid gap-2 sm:grid-cols-2">

                              <p className="text-sm text-gray-600">
                                Quantity:{" "}

                                <span className="font-semibold text-gray-800">
                                  {
                                    item.quantity
                                  }
                                </span>
                              </p>

                              <p className="text-sm text-gray-600">
                                Item Total:{" "}

                                <span className="font-semibold text-gray-800">
                                  ₹
                                  {
                                    item.totalAmount
                                  }
                                </span>
                              </p>

                            </div>

                            <p className="mt-2 break-all text-xs text-gray-400">
                              Product ID:{" "}
                              {
                                item.productId
                              }
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

                {/* TOTAL */}

                <div className="rounded-xl border p-4">

                  <p className="text-sm text-gray-500">
                    Total Amount
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    ₹
                    {
                      selectedOrder.totalAmount
                    }
                  </p>

                </div>

                {/* DATE */}

                <div className="rounded-xl border p-4">

                  <p className="text-sm text-gray-500">
                    Order Date
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatDate(
                      selectedOrder.createdAt
                    )}
                  </p>

                </div>

                {/* CURRENT STATUS */}

                <div className="rounded-xl border p-4">

                  <p className="text-sm text-gray-500">
                    Current Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                      selectedOrder.status
                    )}`}
                  >
                    {formatStatus(
                      selectedOrder.status
                    )}
                  </span>

                </div>

                {/* CURRENT DELIVERY TRACKING */}

                <div className="rounded-xl border p-4">

                  <p className="text-sm text-gray-500">
                    Delivery Tracking
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getTrackingStyle(
                      selectedOrder.trackingStatus
                    )}`}
                  >
                    {formatTrackingStatus(
                      selectedOrder.trackingStatus
                    )}
                  </span>

                </div>

              </div>

              {/* =================================================
                  CANCELLATION DETAILS
              ================================================= */}

              {selectedOrder.status?.toLowerCase() ===
                "cancelled" && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
                      ×
                    </div>

                    <div className="min-w-0">

                      <h3 className="font-semibold text-red-700">
                        Order Cancelled
                      </h3>

                      {selectedOrder.cancellationReason && (
                        <p className="mt-2 text-sm text-red-600">
                          <span className="font-medium">
                            Reason:
                          </span>{" "}
                          {
                            selectedOrder.cancellationReason
                          }
                        </p>
                      )}

                      {selectedOrder.cancellationDate && (
                        <p className="mt-1 text-sm text-red-500">
                          <span className="font-medium">
                            Cancelled on:
                          </span>{" "}
                          {new Date(
                            selectedOrder.cancellationDate
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  STATUS MANAGEMENT
              ================================================= */}

              <div className="mt-8 border-t pt-6">

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <div>

                    <h3 className="text-lg font-bold">
                      Status Management
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Change the main order status from here.
                    </p>

                  </div>

                  <select
                    value={
                      selectedOrder.status ||
                      "pending"
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        selectedOrder,
                        e.target.value
                      )
                    }
                    className="rounded-lg border p-2 font-medium"
                  >

                    <option value="pending">
                      Pending
                    </option>

                    <option value="processing">
                      Processing
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="delivered">
                      Delivered
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

                {/* =================================================
                    DELIVERY TRACKING MANAGEMENT
                ================================================= */}

                <div className="mt-7 rounded-xl border bg-gray-50 p-5">

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                    <div>

                      <h3 className="text-lg font-bold">
                        Delivery Tracking
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Update the customer&apos;s delivery progress.
                      </p>

                    </div>

                    <select
                      value={
                        selectedOrder.trackingStatus ||
                        "order_placed"
                      }
                      onChange={(e) =>
                        handleTrackingChange(
                          selectedOrder,
                          e.target.value
                        )
                      }
                      className={`rounded-lg border px-4 py-2 font-medium ${getTrackingStyle(
                        selectedOrder.trackingStatus
                      )}`}
                    >

                      <option value="order_placed">
                        Order Placed
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="packed">
                        Packed
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="in_transit">
                        In Transit
                      </option>

                      <option value="out_for_delivery">
                        Out for Delivery
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                    </select>

                  </div>

                  {/* TRACKING TIMELINE */}

                  <div className="mt-7">

                    <h4 className="mb-5 text-sm font-semibold text-gray-700">
                      Delivery Progress
                    </h4>

                    {/* DESKTOP */}

                    <div className="hidden overflow-x-auto pb-3 md:block">

                      <div className="flex min-w-[850px]">

                        {trackingSteps.map(
                          (
                            step,
                            index
                          ) => {

                            const currentStep =
                              getTrackingStep(
                                selectedOrder.trackingStatus
                              );

                            const completed =
                              currentStep >=
                              step.number;

                            const active =
                              currentStep ===
                              step.number;

                            return (

                              <div
                                key={
                                  step.value
                                }
                                className="flex flex-1 items-start"
                              >

                                <div className="flex flex-1 flex-col items-center">

                                  <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
                                      completed
                                        ? "bg-black text-white"
                                        : "border-2 border-gray-300 bg-white text-gray-400"
                                    }`}
                                  >
                                    {completed
                                      ? "✓"
                                      : step.number}
                                  </div>

                                  <p
                                    className={`mt-2 text-center text-sm font-semibold ${
                                      active
                                        ? "text-black"
                                        : completed
                                          ? "text-gray-700"
                                          : "text-gray-400"
                                    }`}
                                  >
                                    {
                                      step.label
                                    }
                                  </p>

                                  <p className="mt-1 max-w-[110px] text-center text-xs text-gray-400">
                                    {
                                      step.description
                                    }
                                  </p>

                                </div>

                                {index <
                                  trackingSteps.length -
                                    1 && (

                                  <div
                                    className={`mt-5 h-0.5 flex-1 ${
                                      currentStep >
                                      step.number
                                        ? "bg-black"
                                        : "bg-gray-200"
                                    }`}
                                  />

                                )}

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>

                    {/* MOBILE */}

                    <div className="space-y-4 md:hidden">

                      {trackingSteps.map(
                        (step) => {

                          const currentStep =
                            getTrackingStep(
                              selectedOrder.trackingStatus
                            );

                          const completed =
                            currentStep >=
                            step.number;

                          const active =
                            currentStep ===
                            step.number;

                          return (

                            <div
                              key={
                                step.value
                              }
                              className="flex items-center gap-4"
                            >

                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                  completed
                                    ? "bg-black text-white"
                                    : "border-2 border-gray-300 bg-white text-gray-400"
                                }`}
                              >
                                {completed
                                  ? "✓"
                                  : step.number}
                              </div>

                              <div>

                                <p
                                  className={`text-sm font-semibold ${
                                    active
                                      ? "text-black"
                                      : completed
                                        ? "text-gray-700"
                                        : "text-gray-400"
                                  }`}
                                >
                                  {
                                    step.label
                                  }
                                </p>

                                <p className="text-xs text-gray-400">
                                  {
                                    step.description
                                  }
                                </p>

                              </div>

                            </div>

                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* TRACKING HISTORY */}

                  {selectedOrder.trackingHistory &&
                    selectedOrder.trackingHistory.length >
                      0 && (

                    <div className="mt-7 border-t pt-5">

                      <h4 className="mb-4 text-sm font-semibold text-gray-700">
                        Tracking History
                      </h4>

                      <div className="space-y-3">

                        {[
                          ...selectedOrder.trackingHistory,
                        ]
                          .reverse()
                          .map(
                            (
                              history,
                              index
                            ) => (

                              <div
                                key={`${history.status}-${history.date}-${index}`}
                                className="rounded-lg border bg-white p-4"
                              >

                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                                  <div>

                                    <p className="font-semibold text-gray-800">
                                      {formatTrackingStatus(
                                        history.status
                                      )}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                      {
                                        history.message
                                      }
                                    </p>

                                  </div>

                                  <p className="text-xs text-gray-400">
                                    {history.date
                                      ? new Date(
                                          history.date
                                        ).toLocaleString(
                                          "en-IN"
                                        )
                                      : "Date unavailable"}
                                  </p>

                                </div>

                              </div>

                            )
                          )}

                      </div>

                    </div>

                  )}

                </div>

                {/* CANCELLED */}

                {selectedOrder.status?.toLowerCase() ===
                "cancelled" ? (

                  <div className="mt-6 rounded-xl bg-red-50 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                        ×
                      </div>

                      <div>

                        <p className="font-semibold text-red-700">
                          Order Cancelled
                        </p>

                        <p className="text-sm text-red-600">
                          This order has been cancelled.
                        </p>

                      </div>

                    </div>

                  </div>

                ) : null}

              </div>

              {/* =================================================
                  MODAL ACTIONS
              ================================================= */}

              <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">

                <button
                  type="button"
                  onClick={() => {
                    handleEdit(
                      selectedOrder
                    );

                    setSelectedOrderId(
                      null
                    );
                  }}
                  className="rounded-lg bg-black px-5 py-2.5 font-medium text-white hover:bg-gray-800"
                >
                  Edit Order
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedOrder.id
                    )
                  }
                  className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
                >
                  Delete Order
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedOrderId(
                      null
                    )
                  }
                  className="rounded-lg border px-5 py-2.5 font-medium hover:bg-gray-100"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}