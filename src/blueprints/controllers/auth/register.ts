import { Hono } from "hono";
import { validator } from "hono/validator";
import { z } from "zod";
import PasswordValidator from "password-validator";
import { generateSalt } from "../../../utils/genSalt";
import { PrismaClient } from "@prisma/client";

const app = new Hono();
const prisma = new PrismaClient();
const User = z.object({
	username: z.string(),
});
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
	.oneOf(["Password", "Passw0rd", "Password123", "Pass@1234", "Password@1234"]); // Blacklist these values

const register = app.post(
	"/",
	validator("json", async (value, ctx) => {
		// const data = await ctx.req.json();

		const username = value.username;
		type username = z.infer<typeof User>;
		const password = value.password;

		let email = null;

		if (value.email) {
			email = value.email;
		}

		if (
			typeof username !== "string" ||
			username.length < 3 ||
			!passwordSchema.validate(password)
		) {
			return ctx.text("Invalid!", 400);
		} else {
			// hash password using bun password hashing
			const hashedPwd = await Bun.password.hash(password, {
				algorithm: "argon2id", // "argon2id" | "argon2i" | "argon2d"
				memoryCost: 4, // memory usage in kibibytes
				timeCost: 3, // the number of iterations
			});

			const user = await prisma.user.findMany({
				where: { username: username },
			});
			console.log(user[0]);
			if (!user[0]) {
				const encKey = generateSalt(30);
				// create a new user
				await prisma.user.create({
					data: {
						username: username,
						email: email,
						password: hashedPwd,
						encryptionKey: encKey,
					},
				});
				// count the number of users
				// const count = await prisma.user.count();
				// console.log(`There are ${count} users in the database.`);
				return ctx.json({ created: true, data: value }, 201);
			} else {
				return ctx.json({ success: false, message: "User Already Exist" }, 409);
			}
		}
	}),
);
export default register;
