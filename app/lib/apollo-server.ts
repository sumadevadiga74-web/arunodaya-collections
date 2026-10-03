import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";

const apolloServerClient = new ApolloClient({
  ssrMode: true,
  link: new HttpLink({
    uri:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL
        ? "https://arunodaya-api-one.vercel.app/graphql"
        : "http://localhost:4000/graphql"),
    fetch,
  }),
  cache: new InMemoryCache(),
});

export default apolloServerClient;