import { HeaderMap } from "@apollo/server";
import { server } from "../server.js";

let started = false;

export default async function handler(req, res) {
  try {
    if (!started) {
      await server.start();
      started = true;
    }

    const headers = new HeaderMap();

    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(
          key.toLowerCase(),
          Array.isArray(value) ? value.join(", ") : value
        );
      }
    }

    const httpGraphQLRequest = {
      method: req.method?.toUpperCase() || "POST",
      headers,
      search: new URL(req.url || "", "http://localhost").search,
      body: req.body,
    };

    const result = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest,

      context: async () => {
        const authHeader = req.headers.authorization || "";

        const token = authHeader.startsWith("Bearer ")
          ? authHeader.substring(7)
          : "";

        let user = null;

        if (token) {
          try {
            const { verifyToken } = await import("../auth.js");
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

    res.statusCode = result.status || 200;

    for (const [key, value] of result.headers) {
      res.setHeader(key, value);
    }

    if (result.body.kind === "complete") {
      res.end(result.body.string);
      return;
    }

    for await (const chunk of result.body.asyncIterator) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error("GraphQL API ERROR:", error);

    res.statusCode = 500;
    res.json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}