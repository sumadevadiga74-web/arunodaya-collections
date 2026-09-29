
"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DASHBOARD_QUERY = gql`
  query Dashboard {
    dashboardStats {
      totalProducts
      totalCategories
      totalBrands
      totalUsers
      totalOrders
      totalSales
    }

    monthlySalesSummary {
      month
      sales
      orders
      quantity
    }

    topSellingProducts {
      productId
      quantity
      sales
      orders
    }

    recentOrders {
      id
      userId
      productId
      quantity
      totalAmount
      status
      createdAt
    }

    orderStatusSummary {
      status
      orders
      sales
    }

    salesByProduct {
      productId
      sales
      quantity
      orders
    }

    customerSalesSummary {
      userId
      orders
      quantity
      sales
    }

    salesChart {
      date
      sales
      orders
      quantity
    }
  }
`;

type DashboardData = {
  dashboardStats: {
    totalProducts: number;
    totalCategories: number;
    totalBrands: number;
    totalUsers: number;
    totalOrders: number;
    totalSales: number;
  };

  monthlySalesSummary: {
    month: string;
    sales: number;
    orders: number;
    quantity: number;
  }[];

  topSellingProducts: {
    productId: string;
    quantity: number;
    sales: number;
    orders: number;
  }[];

  recentOrders: {
    id: string;
    userId: string;
    productId: string;
    quantity: number;
    totalAmount: number;
    status?: string;
    createdAt?: string | number;
  }[];

  orderStatusSummary: {
    status: string;
    orders: number;
    sales: number;
  }[];

  salesByProduct: {
    productId: string;
    sales: number;
    quantity: number;
    orders: number;
  }[];

  customerSalesSummary: {
    userId: string;
    orders: number;
    quantity: number;
    sales: number;
  }[];

  salesChart: {
    date: string;
    sales: number;
    orders: number;
    quantity: number;
  }[];
};

export default function Dashboard() {
  const { data, loading, error } =
    useQuery<DashboardData>(DASHBOARD_QUERY);

  /*
   * DATE FORMATTER
   *
   * Handles:
   * 1. ISO date strings
   * 2. Numeric timestamps
   * 3. MongoDB-style date strings
   */
  const formatDate = (createdAt?: string | number) => {
    if (!createdAt) {
      return "Date unavailable";
    }

    let date: Date;

    if (typeof createdAt === "number") {
      date = new Date(createdAt);
    } else {
      const numericValue = Number(createdAt);

      if (
        createdAt.trim() !== "" &&
        !Number.isNaN(numericValue) &&
        /^\d+$/.test(createdAt)
      ) {
        date = new Date(numericValue);
      } else {
        date = new Date(createdAt);
      }
    }

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatStatus = (status?: string) => {
    if (!status) {
      return "Pending";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            Loading dashboard...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
            Error loading dashboard: {error.message}
          </div>
        </div>
      </main>
    );
  }

  const stats = data?.dashboardStats;

  if (!stats) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          No dashboard data found.
        </div>
      </main>
    );
  }

  const monthlySales = data.monthlySalesSummary ?? [];
  const topSellingProducts = data.topSellingProducts ?? [];
  const recentOrders = data.recentOrders ?? [];
  const orderStatusSummary = data.orderStatusSummary ?? [];
  const salesByProduct = data.salesByProduct ?? [];
  const customerSalesSummary =
    data.customerSalesSummary ?? [];
  const salesChart = data.salesChart ?? [];

  const maxSales =
    monthlySales.length > 0
      ? Math.max(
          ...monthlySales.map((item) => item.sales),
          1
        )
      : 1;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Overview of Arunodaya Collections
          </p>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Sales
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalSales)}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Overall sales amount
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalOrders}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Orders received
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalProducts}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Products in catalog
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Customers
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalUsers}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Registered users
            </p>
          </div>

        </div>

        {/* ORDER STATUS QUICK SUMMARY */}

        <section className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                label: "Pending",
                value:
                  orderStatusSummary.find(
                    (item) =>
                      item.status.toLowerCase() ===
                      "pending"
                  )?.orders ?? 0,
              },
              {
                label: "Processing",
                value:
                  orderStatusSummary.find(
                    (item) =>
                      item.status.toLowerCase() ===
                      "processing"
                  )?.orders ?? 0,
              },
              {
                label: "Completed",
                value:
                  orderStatusSummary.find(
                    (item) =>
                      item.status.toLowerCase() ===
                      "completed"
                  )?.orders ?? 0,
              },
              {
                label: "Cancelled",
                value:
                  orderStatusSummary.find(
                    (item) =>
                      item.status.toLowerCase() ===
                      "cancelled"
                  )?.orders ?? 0,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-gray-500">
                  {item.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}

          </div>
        </section>

        {/* SALES TREND */}

<section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

  <div className="mb-6">
    <h2 className="text-xl font-semibold text-gray-900">
      Sales Trend
    </h2>

    <p className="text-sm text-gray-500">
      Daily sales performance
    </p>
  </div>

  {salesChart.length === 0 ? (
    <p className="text-gray-500">
      No sales trend data found.
    </p>
  ) : (
    <div className="h-[350px] w-full">

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={salesChart}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
          />

          <YAxis />

          <Tooltip
            formatter={(value) =>
              formatCurrency(Number(value))
            }
          />

          <Line
            type="monotone"
            dataKey="sales"
            stroke="#000000"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  )}

</section>

        {/* MONTHLY SALES */}

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Monthly Sales
            </h2>

            <p className="text-sm text-gray-500">
              Sales performance by month
            </p>
          </div>

          {monthlySales.length === 0 ? (
            <p className="text-gray-500">
              No monthly sales data found.
            </p>
          ) : (
            <div className="space-y-5">

              {monthlySales.map((item) => (
                <div key={item.month}>

                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-gray-700">
                      {item.month}
                    </span>

                    <span className="font-semibold text-gray-900">
                      {formatCurrency(item.sales)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-black"
                      style={{
                        width: `${Math.max(
                          (item.sales / maxSales) * 100,
                          3
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex gap-5 text-xs text-gray-500">
                    <span>
                      Orders: {item.orders}
                    </span>

                    <span>
                      Quantity: {item.quantity}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* TWO COLUMN ANALYTICS */}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* ORDER STATUS */}

          <section className="rounded-xl bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Order Status
              </h2>

              <p className="text-sm text-gray-500">
                Current order breakdown
              </p>
            </div>

            {orderStatusSummary.length === 0 ? (
              <p className="text-gray-500">
                No order status data found.
              </p>
            ) : (
              <div className="space-y-4">

                {orderStatusSummary.map((item) => (
                  <div
                    key={item.status}
                    className="rounded-lg border p-4"
                  >

                    <div className="flex items-center justify-between">

                      <p className="font-semibold capitalize">
                        {item.status}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {item.orders} orders
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      Sales:{" "}
                      <span className="font-semibold text-gray-700">
                        {formatCurrency(item.sales)}
                      </span>
                    </p>

                  </div>
                ))}

              </div>
            )}

          </section>

          {/* TOP SELLING PRODUCTS */}

          <section className="rounded-xl bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Top Selling Products
              </h2>

              <p className="text-sm text-gray-500">
                Best performing products
              </p>
            </div>

            {topSellingProducts.length === 0 ? (
              <p className="text-gray-500">
                No top selling products found.
              </p>
            ) : (
              <div className="space-y-4">

                {topSellingProducts.map(
                  (item, index) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between border-b pb-4 last:border-b-0"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 font-semibold">
                          {index + 1}
                        </div>

                        <div>
                          <p className="break-all font-medium text-gray-900">
                            {item.productId}
                          </p>

                          <p className="text-sm text-gray-500">
                            {item.orders} orders ·{" "}
                            {item.quantity} sold
                          </p>
                        </div>

                      </div>

                      <p className="font-semibold">
                        {formatCurrency(item.sales)}
                      </p>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

        </div>

        {/* RECENT ORDERS */}

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Orders
            </h2>

            <p className="text-sm text-gray-500">
              Latest orders from customers
            </p>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500">
              No recent orders found.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left">

                <thead>
                  <tr className="border-b text-sm text-gray-500">

                    <th className="pb-3">
                      Order ID
                    </th>

                    <th className="pb-3">
                      User
                    </th>

                    <th className="pb-3">
                      Product
                    </th>

                    <th className="pb-3">
                      Quantity
                    </th>

                    <th className="pb-3">
                      Total
                    </th>

                    <th className="pb-3">
                      Status
                    </th>

                    <th className="pb-3">
                      Date
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-b-0"
                    >

                      <td className="py-4">
                        <span className="block max-w-[220px] break-all font-medium text-gray-900">
                          {order.id}
                        </span>
                      </td>

                      <td className="py-4">
                        {order.userId}
                      </td>

                      <td className="py-4">
                        {order.productId}
                      </td>

                      <td className="py-4">
                        {order.quantity}
                      </td>

                      <td className="py-4 font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>

                      <td className="py-4 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* SALES BY PRODUCT */}

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Sales By Product
            </h2>

            <p className="text-sm text-gray-500">
              Product-wise sales performance
            </p>
          </div>

          {salesByProduct.length === 0 ? (
            <p className="text-gray-500">
              No sales by product found.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b text-sm text-gray-500">

                    <th className="pb-3">
                      Product
                    </th>

                    <th className="pb-3">
                      Sales
                    </th>

                    <th className="pb-3">
                      Quantity
                    </th>

                    <th className="pb-3">
                      Orders
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {salesByProduct.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b last:border-b-0"
                    >

                      <td className="py-4 font-medium">
                        {item.productId}
                      </td>

                      <td className="py-4 font-medium">
                        {formatCurrency(item.sales)}
                      </td>

                      <td className="py-4">
                        {item.quantity}
                      </td>

                      <td className="py-4">
                        {item.orders}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* CUSTOMER SALES */}

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Customer Sales Summary
            </h2>

            <p className="text-sm text-gray-500">
              Customer-wise sales performance
            </p>
          </div>

          {customerSalesSummary.length === 0 ? (
            <p className="text-gray-500">
              No customer sales data found.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b text-sm text-gray-500">

                    <th className="pb-3">
                      Customer
                    </th>

                    <th className="pb-3">
                      Orders
                    </th>

                    <th className="pb-3">
                      Quantity
                    </th>

                    <th className="pb-3">
                      Sales
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {customerSalesSummary.map(
                    (item) => (
                      <tr
                        key={item.userId}
                        className="border-b last:border-b-0"
                      >

                        <td className="py-4 font-medium">
                          {item.userId}
                        </td>

                        <td className="py-4">
                          {item.orders}
                        </td>

                        <td className="py-4">
                          {item.quantity}
                        </td>

                        <td className="py-4 font-medium">
                          {formatCurrency(item.sales)}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* CATALOG SUMMARY */}

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-gray-900">
            Catalog Summary
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-lg border p-5">
              <p className="text-sm text-gray-500">
                Categories
              </p>

              <p className="mt-2 text-2xl font-bold">
                {stats.totalCategories}
              </p>
            </div>

            <div className="rounded-lg border p-5">
              <p className="text-sm text-gray-500">
                Brands
              </p>

              <p className="mt-2 text-2xl font-bold">
                {stats.totalBrands}
              </p>
            </div>

            <div className="rounded-lg border p-5">
              <p className="text-sm text-gray-500">
                Products
              </p>

              <p className="mt-2 text-2xl font-bold">
                {stats.totalProducts}
              </p>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

