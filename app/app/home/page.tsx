import { gql } from "@apollo/client";
import apolloServerClient from "../../lib/apollo-server";
import Home from "../../components/Home/Home";

const HOME_QUERY = gql`
  query Home {
    home {
      id
      title
      description
      image
      status
    }
  }
`;

export default async function HomePage() {
  const { data } = await apolloServerClient.query({
    query: HOME_QUERY,
    fetchPolicy: "no-cache",
  });

  return <Home initialHome={data?.home ?? null} />;
}