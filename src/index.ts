import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import notemy from "./blueprints/controllers/route";

const app = new Hono();
app.use("*", prettyJSON());
app.notFound((ctx) => ctx.json({ message: "Not Found", ok: false }, 404));
app.use("*", logger());
app.route("/api/auth", notemy);


export default app;
