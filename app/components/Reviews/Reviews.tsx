"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

/* =========================================================
   REVIEWS QUERY
========================================================= */
const REVIEWS_QUERY = gql`
  query AllReviews {
    allReviews {
      id
      productId
      productName
      userId
      customerName
      customerEmail
      rating
      comment
      createdAt
    }
  }
`;

/* =========================================================
   DELETE REVIEW
========================================================= */

const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id) {
      id
    }
  }
`;

/* =========================================================
   TYPES
========================================================= */
type Review = {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Reviews() {
  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<{ allReviews: Review[] }>(
    REVIEWS_QUERY
  );

  const [deleteReview] =
    useMutation(DELETE_REVIEW);

  const [selectedReviewId, setSelectedReviewId] =
    useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
const [ratingFilter, setRatingFilter] = useState("all");

  const formatDate = (value?: string) => {
    if (!value) {
      return "Date unavailable";
    }

    const timestamp = Number(value);

    if (!Number.isNaN(timestamp)) {
      const date = new Date(timestamp);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this review?"
      )
    ) {
      return;
    }

    try {
      await deleteReview({
        variables: {
          id,
        },
      });

      if (selectedReviewId === id) {
        setSelectedReviewId(null);
      }

      alert("Review deleted successfully");

      await refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading reviews...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-700">
            Error loading reviews
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const reviews = data?.allReviews ?? [];
const search = searchTerm.trim().toLowerCase();

const filteredReviews = reviews.filter((review) => {
  const matchesSearch =
    !search ||
    review.productName?.toLowerCase().includes(search) ||
    review.customerName?.toLowerCase().includes(search) ||
    review.customerEmail?.toLowerCase().includes(search) ||
    review.comment.toLowerCase().includes(search) ||
    review.productId.toLowerCase().includes(search) ||
    review.userId.toLowerCase().includes(search);

  const matchesRating =
    ratingFilter === "all" ||
    review.rating === Number(ratingFilter);

  return matchesSearch && matchesRating;
});

  const totalReviews = reviews.length;

  const fiveStarReviews = reviews.filter(
    (review) => review.rating === 5
  ).length;

  const fourStarReviews = reviews.filter(
    (review) => review.rating === 4
  ).length;

  const lowRatingReviews = reviews.filter(
    (review) => review.rating <= 2
  ).length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum + review.rating,
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  const selectedReview = reviews.find(
    (review) =>
      review.id === selectedReviewId
  );

  return (
    <div className="p-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Reviews
        </h1>

        <p className="mt-1 text-gray-500">
          Manage customer product reviews
        </p>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Reviews
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalReviews}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Average Rating
          </p>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-3xl font-bold">
              {averageRating}
            </p>

            <span className="text-xl text-[#C9A227]">
              ★
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            5 Star Reviews
          </p>

          <p className="mt-2 text-3xl font-bold text-[#C9A227]">
            {fiveStarReviews}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Low Ratings
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {lowRatingReviews}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
<div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
  <div className="grid gap-4 md:grid-cols-[1fr_200px]">
    {/* Search */}
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Search Reviews
      </label>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search customer, product, email or comment..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
      />
    </div>

    {/* Rating Filter */}
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Filter by Rating
      </label>

      <select
        value={ratingFilter}
        onChange={(e) => setRatingFilter(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
      >
        <option value="all">All Ratings</option>
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>


            <button
        type="button"
        onClick={() => {
          setSearchTerm("");
          setRatingFilter("all");
        }}
        className="mt-2 text-sm font-medium text-[#C9A227] hover:underline"
      >
        Clear Filters
      </button>
    </div>
  </div>
</div>

      {/* =====================================================
          REVIEWS TABLE
      ===================================================== */}

      {reviews.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">
            ⭐
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            No reviews found
          </h2>

          <p className="mt-2 text-gray-500">
            Customers have not submitted any reviews yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-sm font-semibold">
                    Review ID
                  </th>
<th className="p-4 text-sm font-semibold">
  Product
</th>

<th className="p-4 text-sm font-semibold">
  Customer
</th>

                  <th className="p-4 text-sm font-semibold">
                    Rating
                  </th>

                  <th className="p-4 text-sm font-semibold">
                    Comment
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
          {filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    {/* REVIEW ID */}

                    <td className="max-w-[170px] p-4">
                      <p
                        className="truncate text-sm font-medium"
                        title={review.id}
                      >
                        {review.id}
                      </p>
                    </td>

                  {/* PRODUCT */}

<td className="max-w-[220px] p-4">
  <p
    className="truncate text-sm font-medium text-gray-900"
    title={review.productName || review.productId}
  >
    {review.productName || "Unknown Product"}
  </p>

  <p
    className="mt-1 truncate text-xs text-gray-400"
    title={review.productId}
  >
    ID: {review.productId}
  </p>
</td>

{/* CUSTOMER */}

<td className="max-w-[220px] p-4">
  <p
    className="truncate text-sm font-medium text-gray-900"
    title={review.customerName || review.userId}
  >
    {review.customerName || "Unknown Customer"}
  </p>

  {review.customerEmail && (
    <p
      className="mt-1 truncate text-xs text-gray-400"
      title={review.customerEmail}
    >
      {review.customerEmail}
    </p>
  )}
</td>

                    {/* RATING */}

                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <div className="flex text-lg">
                          {Array.from({
                            length: 5,
                          }).map(
                            (_, index) => (
                              <span
                                key={index}
                                className={
                                  index <
                                  review.rating
                                    ? "text-[#C9A227]"
                                    : "text-gray-300"
                                }
                              >
                                ★
                              </span>
                            )
                          )}
                        </div>

                        <span className="ml-1 text-sm font-semibold">
                          {review.rating}/5
                        </span>
                      </div>
                    </td>

                    {/* COMMENT */}

                    <td className="max-w-[300px] p-4">
                      <p
                        className="truncate text-sm text-gray-600"
                        title={review.comment}
                      >
                        {review.comment}
                      </p>
                    </td>

                    {/* DATE */}

                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(
                        review.createdAt
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReviewId(
                              review.id
                            )
                          }
                          className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              review.id
                            )
                          }
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
<div className="border-t bg-gray-50 px-4 py-3 text-sm text-gray-500">
  Showing{" "}
  <span className="font-semibold text-gray-700">
    {filteredReviews.length}
  </span>{" "}
  of{" "}
  <span className="font-semibold text-gray-700">
    {reviews.length}
  </span>{" "}
  reviews
</div>
        </div>
      )}

      {/* =====================================================
          REVIEW DETAILS MODAL
      ===================================================== */}

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Review Details
                </p>

                <h2 className="mt-1 break-all text-xl font-bold">
                  {selectedReview.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReviewId(null)
                }
                className="rounded-full border px-3 py-1 text-lg hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            {/* CONTENT */}

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-gray-500">
                    Product ID
                  </p>

                  <p className="mt-1 break-all font-semibold">
                    {selectedReview.productId}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm text-gray-500">
                    User ID
                  </p>

                  <p className="mt-1 break-all font-semibold">
                    {selectedReview.userId}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm text-gray-500">
                    Rating
                  </p>

                  <div className="mt-1 flex items-center">
                    {Array.from({
                      length: 5,
                    }).map(
                      (_, index) => (
                        <span
                          key={index}
                          className={`text-2xl ${
                            index <
                            selectedReview.rating
                              ? "text-[#C9A227]"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      )
                    )}

                    <span className="ml-2 font-semibold">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm text-gray-500">
                    Date
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatDate(
                      selectedReview.createdAt
                    )}
                  </p>
                </div>

                <div className="rounded-xl border p-4 sm:col-span-2">
                  <p className="text-sm text-gray-500">
                    Customer Review
                  </p>

                  <p className="mt-3 leading-7 text-gray-700">
                    {selectedReview.comment}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">
                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedReview.id
                    )
                  }
                  className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
                >
                  Delete Review
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedReviewId(null)
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