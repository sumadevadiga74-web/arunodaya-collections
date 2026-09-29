import Review from "../../models/Review.js";
import Order from "../../models/Order.js";
import { requireAuth } from "../../permissions.js";

export const reviewMutationTypeDefs = `#graphql

  extend type Mutation {
    createReview(
      productId: ID!
      rating: Int!
      comment: String!
    ): Review!

    deleteReview(id: ID!): Review
  }
`;

export const reviewMutationResolvers = {
  Mutation: {
    createReview: async (
      _,
      { productId, rating, comment },
      context
    ) => {
      const user = requireAuth(context);

      if (rating < 1 || rating > 5) {
        throw new Error(
          "Rating must be between 1 and 5"
        );
      }

      if (!comment || !comment.trim()) {
        throw new Error(
          "Review comment is required"
        );
      }

      const orders = await Order.find({
        userId: String(user.userId),
        status: "delivered",
        "items.productId": String(productId),
      });

      if (orders.length === 0) {
        throw new Error(
          "You can review this product only after it has been delivered."
        );
      }

      const existingReview =
        await Review.findOne({
          productId: String(productId),
          userId: String(user.userId),
        });

      if (existingReview) {
        throw new Error(
          "You have already reviewed this product."
        );
      }

      return await Review.create({
        productId: String(productId),
        userId: String(user.userId),
        rating,
        comment: comment.trim(),
      });
    },

    /* =====================================================
       DELETE REVIEW
    ===================================================== */

    deleteReview: async (
      _,
      { id },
      context
    ) => {
      const user = requireAuth(context);

      // Only admin can delete reviews
      if (user.role !== "admin") {
        throw new Error(
          "Only admin can delete reviews"
        );
      }

      const review =
        await Review.findById(id);

      if (!review) {
        throw new Error(
          "Review not found"
        );
      }

      return await Review.findByIdAndDelete(
        id
      );
    },
  },
};