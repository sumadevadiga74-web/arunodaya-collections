import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import connectDB from "./config/db.js";
import { verifyToken } from "./auth.js";

import {
  productTypeDefs,
  productResolvers,
} from "./graphql/queries/product.query.js";

import {
  reviewTypeDefs,
  reviewResolvers,
} from "./graphql/queries/review.query.js";

import {
  productMutationTypeDefs,
  productMutationResolvers,
} from "./graphql/mutations/product.mutation.js";

import {
  reviewMutationTypeDefs,
  reviewMutationResolvers,
} from "./graphql/mutations/review.mutation.js";

import {
  categoryTypeDefs,
  categoryResolvers,
} from "./graphql/queries/category.query.js";

import {
  categoryMutationTypeDefs,
  categoryMutationResolvers,
} from "./graphql/mutations/category.mutation.js";

import {
  brandTypeDefs,
  brandResolvers,
} from "./graphql/queries/brand.query.js";

import {
  brandMutationTypeDefs,
  brandMutationResolvers,
} from "./graphql/mutations/brand.mutation.js";

import {
  colourTypeDefs,
  colourResolvers,
} from "./graphql/queries/colour.query.js";

import {
  colourMutationTypeDefs,
  colourMutationResolvers,
} from "./graphql/mutations/colour.mutation.js";

import {
  sizeTypeDefs,
  sizeResolvers,
} from "./graphql/queries/size.query.js";

import {
  sizeMutationTypeDefs,
  sizeMutationResolvers,
} from "./graphql/mutations/size.mutation.js";

import {
  basketTypeDefs,
  basketResolvers,
} from "./graphql/queries/basket.query.js";

import {
  wishlistTypeDefs,
  wishlistResolvers,
} from "./graphql/queries/wishlist.query.js";

import {
  wishlistMutationTypeDefs,
  wishlistMutationResolvers,
} from "./graphql/mutations/wishlist.mutation.js";

import {
  basketMutationTypeDefs,
  basketMutationResolvers,
} from "./graphql/mutations/basket.mutation.js";

import {
  orderTypeDefs,
  orderResolvers,
} from "./graphql/queries/order.query.js";

import {
  orderMutationTypeDefs,
  orderMutationResolvers,
} from "./graphql/mutations/order.mutation.js";

import {
  userTypeDefs,
  userResolvers,
} from "./graphql/queries/user.query.js";

import {
  userMutationTypeDefs,
  userMutationResolvers,
} from "./graphql/mutations/user.mutation.js";

import {
  homeTypeDefs,
  homeResolvers,
} from "./graphql/queries/home.query.js";

import {
  homeMutationTypeDefs,
  homeMutationResolvers,
} from "./graphql/mutations/home.mutation.js";

import {
  articleTypeDefs,
  articleResolvers,
} from "./graphql/queries/article.query.js";

import {
  articleMutationTypeDefs,
  articleMutationResolvers,
} from "./graphql/mutations/article.mutation.js";

import {
  contactTypeDefs,
  contactResolvers,
} from "./graphql/queries/contact.query.js";

import {
  contactMutationTypeDefs,
  contactMutationResolvers,
} from "./graphql/mutations/contact.mutation.js";

import {
  contestTypeDefs,
  contestResolvers,
} from "./graphql/queries/contest.query.js";

import {
  contestMutationTypeDefs,
  contestMutationResolvers,
} from "./graphql/mutations/contest.mutation.js";

import {
  participantTypeDefs,
  participantResolvers,
} from "./graphql/queries/participant.query.js";

import {
  participantMutationTypeDefs,
  participantMutationResolvers,
} from "./graphql/mutations/participant.mutation.js";

import {
  sizechartTypeDefs,
  sizechartResolvers,
} from "./graphql/queries/sizechart.query.js";

import {
  sizechartMutationTypeDefs,
  sizechartMutationResolvers,
} from "./graphql/mutations/sizechart.mutation.js";

import {
  mediaMutationTypeDefs,
  mediaMutationResolvers,
} from "./graphql/mutations/media.mutation.js";

import {
  salesChartTypeDefs,
  salesChartResolvers,
} from "./graphql/queries/salesChart.query.js";

import {
  dashboardStatsTypeDefs,
  dashboardStatsResolvers,
} from "./graphql/queries/dashboardStats.query.js";

import {
  topSellingProductsTypeDefs,
  topSellingProductsResolvers,
} from "./graphql/queries/topSellingProducts.query.js";

import {
  recentOrdersTypeDefs,
  recentOrdersResolvers,
} from "./graphql/queries/recentOrders.query.js";

import {
  orderStatusSummaryTypeDefs,
  orderStatusSummaryResolvers,
} from "./graphql/queries/orderStatusSummary.query.js";

import {
  monthlySalesSummaryTypeDefs,
  monthlySalesSummaryResolvers,
} from "./graphql/queries/monthlySalesSummary.query.js";

import {
  salesByProductTypeDefs,
  salesByProductResolvers,
} from "./graphql/queries/salesByProduct.query.js";

import {
  customerSalesSummaryTypeDefs,
  customerSalesSummaryResolvers,
} from "./graphql/queries/customerSalesSummary.query.js";

import {
  settingsTypeDefs,
  settingsResolvers,
} from "./graphql/queries/settings.query.js";

import {
  settingsMutationTypeDefs,
  settingsMutationResolvers,
} from "./graphql/mutations/settings.mutation.js";

import {
  pageTypeDefs,
  pageResolvers,
} from "./graphql/queries/page.query.js";

import {
  pageMutationTypeDefs,
  pageMutationResolvers,
} from "./graphql/mutations/page.mutation.js";

import {
  authTypeDefs,
  authResolvers,
} from "./graphql/mutations/auth.mutation.js";

import { getUserFromToken } from "./auth.js";

import {
  mediaTypeDefs,
  mediaResolvers,
} from "./graphql/queries/media.query.js";

const baseTypeDefs = `#graphql
  type Query {
    hello: String
  }

  type Mutation {
    _empty: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Arunodaya Collections API is working!",

    ...productResolvers.Query,
    ...reviewResolvers.Query,
    ...categoryResolvers.Query,
    ...brandResolvers.Query,
    ...colourResolvers.Query,
    ...sizeResolvers.Query,
    ...basketResolvers.Query,
    ...wishlistResolvers.Query,
    ...orderResolvers.Query,
    ...userResolvers.Query,
    ...homeResolvers.Query,
    ...articleResolvers.Query,
    ...contactResolvers.Query,
    ...contestResolvers.Query,
    ...participantResolvers.Query,
    ...sizechartResolvers.Query,
    ...salesChartResolvers.Query,
    ...dashboardStatsResolvers.Query,
    ...topSellingProductsResolvers.Query,
    ...recentOrdersResolvers.Query,
    ...orderStatusSummaryResolvers.Query,
    ...monthlySalesSummaryResolvers.Query,
    ...salesByProductResolvers.Query,
    ...customerSalesSummaryResolvers.Query,
    ...settingsResolvers.Query,
    ...pageResolvers.Query,
...mediaResolvers.Query,
  },

  Mutation: {
    ...productMutationResolvers.Mutation,
    ...reviewMutationResolvers.Mutation,
    ...categoryMutationResolvers.Mutation,
    ...brandMutationResolvers.Mutation,
    ...colourMutationResolvers.Mutation,
    ...sizeMutationResolvers.Mutation,
    ...basketMutationResolvers.Mutation,
    ...wishlistMutationResolvers.Mutation,
    ...orderMutationResolvers.Mutation,
    ...userMutationResolvers.Mutation,
    ...homeMutationResolvers.Mutation,
    ...articleMutationResolvers.Mutation,
    ...contactMutationResolvers.Mutation,
    ...contestMutationResolvers.Mutation,
    ...participantMutationResolvers.Mutation,
    ...sizechartMutationResolvers.Mutation,
    ...settingsMutationResolvers.Mutation,
    ...pageMutationResolvers.Mutation,
    ...authResolvers.Mutation,
...mediaMutationResolvers.Mutation,
  },

  Product: productResolvers.Product,
  Review: reviewResolvers.Review,
  Category: categoryResolvers.Category,
  Brand: brandResolvers.Brand,
  Colour: colourResolvers.Colour,
  Size: sizeResolvers.Size,
  Basket: basketResolvers.Basket,
  Wishlist: wishlistResolvers.Wishlist,
  Order: orderResolvers.Order,
  User: userResolvers.User,
  Article: articleResolvers.Article,
  Contact: contactResolvers.Contact,
  Contest: contestResolvers.Contest,
  Participant: participantResolvers.Participant,
  Page: pageResolvers.Page,
};

await connectDB();

export const server = new ApolloServer({
  typeDefs: [
    baseTypeDefs,

    productTypeDefs,
    productMutationTypeDefs,

    reviewTypeDefs,
    reviewMutationTypeDefs,

    categoryTypeDefs,
    categoryMutationTypeDefs,

    brandTypeDefs,
    brandMutationTypeDefs,

    colourTypeDefs,
    colourMutationTypeDefs,

    sizeTypeDefs,
    sizeMutationTypeDefs,

    basketTypeDefs,
    basketMutationTypeDefs,

    wishlistTypeDefs,
    wishlistMutationTypeDefs,

    orderTypeDefs,
    orderMutationTypeDefs,

    userTypeDefs,
    userMutationTypeDefs,

    homeTypeDefs,
    homeMutationTypeDefs,

    articleTypeDefs,
    articleMutationTypeDefs,

    contactTypeDefs,
    contactMutationTypeDefs,

    contestTypeDefs,
    contestMutationTypeDefs,

    participantTypeDefs,
    participantMutationTypeDefs,

    sizechartTypeDefs,
    sizechartMutationTypeDefs,

    salesChartTypeDefs,

    dashboardStatsTypeDefs,

    topSellingProductsTypeDefs,

    recentOrdersTypeDefs,

    orderStatusSummaryTypeDefs,

    monthlySalesSummaryTypeDefs,

    salesByProductTypeDefs,

    customerSalesSummaryTypeDefs,

    settingsTypeDefs,
    settingsMutationTypeDefs,

    pageTypeDefs,
    pageMutationTypeDefs,

mediaTypeDefs,
mediaMutationTypeDefs,

    authTypeDefs,
  ],

  resolvers,
});

if (!process.env.VERCEL) {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },

    context: async ({ req }) => {
      const authHeader = req.headers.authorization || "";

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : "";

      let user = null;

      if (token) {
        try {
          user = verifyToken(token);
        } catch (error) {
          user = null;
        }
      }

      return {
        user,
      };
    },
  });

  console.log(`GraphQL API running at ${url}`);
}