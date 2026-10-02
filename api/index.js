import express from "express";
import cors from "cors";
import { expressMiddleware } from "@as-integrations/express5";
import { server } from "./server.js";
import { verifyToken } from "./auth.js";

const app = express();

await server.start();

app.use(
  cors({
    origin: "*",
  }),
);

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
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
  }),
);

export default app;