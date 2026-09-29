"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/",
});

const authLink = new SetContextLink((_, { headers }) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  console.log("🔐 APOLLO TOKEN EXISTS:", !!token);

  return {
    headers: {
      ...headers,
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