"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/",
});

const authLink = new SetContextLink((prevContext) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  console.log("🔐 APOLLO TOKEN EXISTS:", !!token);

  return {
    headers: {
      ...prevContext.headers,
      authorization: token
        ? `Bearer ${token}`
        : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),

  cache: new InMemoryCache({
    typePolicies: {
      Order: {
        keyFields: ["id"],
      },

      Query: {
        fields: {
          products: {
            keyArgs: false,

            merge(existing, incoming, { args }) {
              if (!incoming) return existing;

              if (!existing || args?.page === 1) {
                return incoming;
              }

              return {
                ...incoming,
                products: [
                  ...(existing.products || []),
                  ...(incoming.products || []),
                ],
              };
            },
          },
        },
      },
    },
  }),
});

export default client;