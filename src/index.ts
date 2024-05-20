import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import swagger from "./docs/swagger";
import notemy from "./blueprints/controllers/route";
import { cors } from "hono/cors";

const app = new Hono();
app.use("*", prettyJSON());
app.notFound((ctx) => ctx.json({ message: "Not Found", ok: false }, 404));
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    // allowMethods: ["*"],
    // origin: "http://localhost:3000",
    // allowMethods: ["GET", "POST", "PATCH"]
  }),
);

app.route("/api/auth", notemy);
app.route("/", swagger);

export default {
  port: 3000,
  fetch: app.fetch,
};
