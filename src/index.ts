import { Hono } from "hono";
import { default as auth } from "./blueprints/controllers/auth";
import { default as note } from "./blueprints/controllers/note";
import { jwt } from "hono/jwt";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";

const app = new Hono();
app.use("*", prettyJSON());
app.notFound((ctx) => ctx.json({ message: "Not Found", ok: false }, 404));
app.use("*", logger());
app.route("/api/auth", auth);
app.route("/api/auth/note", note);

// app.use(
//   "/api/auth/note/*",
//   jwt({
//     secret: process.env.JWT_SECRET || "",
//   }),
// );
// app.get("/api/auth/note/page", (c) => {
//   const payload = c.get("jwtPayload");
//   console.log(payload)
//   return c.json(payload); // eg: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
// });
export default app;
