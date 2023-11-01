import { Hono } from "hono";
import { jwt } from "hono/jwt";
import getRedisClient from "../../../utils/redisClient";
import { PrismaClient } from "@prisma/client";

const app = new Hono();
const redis = getRedisClient();
const prisma = new PrismaClient();

app.use(
	"/*",
	jwt({
		secret: process.env.JWT_SECRET || "",
	}),
);

const getUser = app.get("/", async (c: any) => {
	const payload = c.get("jwtPayload");
	if (payload) {
		try {
			if (redis) {
				try {
					// console.log("trying to fetch from redis");
					const cache = await redis.get(payload.username);
					if (cache) {
						// console.log(cache);
						const data = JSON.parse(cache);
						return c.json({ success: true, data });
					} else {
						throw new Error();
					}
				} catch (err) {
					console.log("trying to fetch from db");
					const user = await prisma.user.findFirst({
						where: { id: payload.id },
					});
					if (user) {
						const data = {
							id: user.id,
							username: user.username,
							email: user.email,
							createdAt: user.createdAt,
							updatedAt: user.updatedAt,
						};
						const json = JSON.stringify(data);
						await redis.set(user.username, json, "EX", 3600);
						console.log("value is set");

						return c.json({
							success: true,
							data,
						});
					}
				}
			}
		} catch (err: any) {
			return c.json({ success: false, message: err.message });
		}
	}
});
export default getUser;
