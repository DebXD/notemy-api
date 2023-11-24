import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import * as jose from "jose";
import { validator } from "hono/validator";
import PasswordValidator from "password-validator";

const passwordSchema = new PasswordValidator();
passwordSchema
	.is()
	.min(8) // Minimum length 8
	.is()
	.max(100) // Maximum length 100
	.has()
	.uppercase() // Must have uppercase letters
	.has()
	.lowercase() // Must have lowercase letters
	.has()
	.digits(2) // Must have at least 2 digits
	.has()
	.not()
	.spaces() // Should not have spaces
	.is()
	.not()
	.oneOf(["Password", "Passw0rd", "Password123"]); // Blacklist these values

const app = new Hono();
const prisma = new PrismaClient();

const login = app.post(
	"/",
	validator("json", async (value, c) => {
		const username = value.username;
		const password = value.password;

		if (
			typeof username !== "string" ||
			username.length < 3 ||
			!passwordSchema.validate(password)
		) {
			return c.text("Invalid!", 400);
		}

		const user = await prisma.user.findMany({ where: { username: username } });

		if (!user[0]) {
			return c.text("User does not exist", 404);
		} else {
			if ((await Bun.password.verify(password, user[0].password)) === false) {
				return c.text("Password didn't match!");
			}
		}
		const userId = user[0].id;
		const email = user[0].email;
		const key = username + user[0].encryptionKey + password;

		const payload = {
			id: userId,
			username: username,
			key: key,
		};

		const jwtSecret = process.env.JWT_SECRET || "";
		const secret = new TextEncoder().encode(jwtSecret);
		const accessToken = await new jose.SignJWT(payload)
			.setExpirationTime("1h")
			.setProtectedHeader({ alg: "HS256" })
			.sign(secret);

		return c.json(
			{
				success: true,
				data: {
					id: userId,
					username: username,
					email: email,
					accessToken: accessToken,
					createdAt: user[0].createdAt,
					updatedAt: user[0].updatedAt,
				},
			},
			200,
		);
	}),
);

export default login;
