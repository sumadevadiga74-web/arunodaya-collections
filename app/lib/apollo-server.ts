import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";

const apolloServerClient = new ApolloClient({
  ssrMode: true,

  link: new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/",
    fetch,
  }),

  cache: new InMemoryCache(),
});

export default apolloServerClient;