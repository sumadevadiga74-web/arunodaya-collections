import Review from "../../models/Review.js";

export const reviewTypeDefs = `#graphql
  type Review {
    id: ID!
    productId: ID!
    userId: ID!
    customerName: String
    customerEmail: String
    productName: String
    rating: Int!
    comment: String!
    createdAt: String
  }

  type ProductRating {
    averageRating: Float!
    totalReviews: Int!

    fiveStar: Int!
    fourStar: Int!
    threeStar: Int!
    twoStar: Int!
    oneStar: Int!
  }

  extend type Query {
    productReviews(productId: ID!): [Review!]!
    productRating(productId: ID!): ProductRating!

    allReviews: [Review!]!
  }
`;

export const reviewResolvers = {
  Query: {
    productReviews: async (_, { productId }) => {
      const reviews = await Review.find({
        productId: String(productId),
      }).sort({
        createdAt: -1,
      });

      const User = (await import("../../models/User.js")).default;

      return await Promise.all(
        reviews.map(async (review) => {
          const user = await User.findById(review.userId);

          return {
            ...review.toObject(),
            id: review._id.toString(),
            customerName: user?.name || "Customer",
            customerEmail: user?.email || "",
          };
        })
      );
    },

    productRating: async (_, { productId }) => {
      const reviews = await Review.find({
        productId: String(productId),
      }).lean();

      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          fiveStar: 0,
          fourStar: 0,
          threeStar: 0,
          twoStar: 0,
          oneStar: 0,
        };
      }

      const totalRating = reviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0
      );

      const averageRating = Number(
        (totalRating / totalReviews).toFixed(1)
      );

      return {
        averageRating,
        totalReviews,

        fiveStar: reviews.filter(
          (review) => Number(review.rating) === 5
        ).length,

        fourStar: reviews.filter(
          (review) => Number(review.rating) === 4
        ).length,

        threeStar: reviews.filter(
          (review) => Number(review.rating) === 3
        ).length,

        twoStar: reviews.filter(
          (review) => Number(review.rating) === 2
        ).length,

        oneStar: reviews.filter(
          (review) => Number(review.rating) === 1
        ).length,
      };
    },

    allReviews: async () => {
      const reviews = await Review.find().sort({
        createdAt: -1,
      });

      const User = (await import("../../models/User.js")).default;
      const Product = (await import("../../models/Product.js")).default;

      return await Promise.all(
        reviews.map(async (review) => {
          const user = await User.findById(review.userId);
          const product = await Product.findById(review.productId);

          return {
            ...review.toObject(),
            id: review._id.toString(),
            customerName:
              user?.name || "Unknown Customer",
            customerEmail: user?.email || "",
            productName:
              product?.name || "Unknown Product",
          };
        })
      );
    },
  },

  Review: {
    id: (review) => review._id.toString(),
  },
};