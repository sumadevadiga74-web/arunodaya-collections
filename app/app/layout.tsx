import type { Metadata } from "next";
import ApolloProviderWrapper from "./ApolloProvider";
import Layout from "../components/Layout/Layout";
import GlobalAlert from "../components/GlobalAlert/GlobalAlert";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arunodaya Collections",
  description: "Arunodaya Collections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ApolloProviderWrapper>
  <Layout>{children}</Layout>
  <GlobalAlert />
</ApolloProviderWrapper>
      </body>
    </html>
  );
}