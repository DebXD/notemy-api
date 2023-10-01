import { Hono } from "hono";
import { default as auth } from "./blueprints/controllers/auth";
import { default as notes } from "./blueprints/controllers/note";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";

const app = new Hono();
app.use("*", prettyJSON());
app.notFound((ctx) => ctx.json({ message: "Not Found", ok: false }, 404));
app.use("*", logger());
app.route("/api/auth", auth);
app.route("/api/auth/notes", notes);

export default app;
