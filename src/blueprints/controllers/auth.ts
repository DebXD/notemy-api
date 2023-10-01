import { Hono } from "hono";
import { validator } from "hono/validator";
import { PrismaClient } from "@prisma/client";
import { generateSalt } from "../../utils/genSalt";
import PasswordValidator from "password-validator";
import { sign, verify, decode } from "hono/jwt";
import { z } from "zod";

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
  .oneOf(["Password", "Passw0rd", "Password123"]); // Blacklist these values

app.post(
  "/register",
  validator("json", async (value, ctx) => {
    // const data = await ctx.req.json();

    const username = value.username;
    type username = z.infer<typeof User>
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
      const count = await prisma.user.count();
      console.log(`There are ${count} users in the database.`);
    }

    return ctx.json({ created: true, data: value }, 201);
  }),
);

app.post(
  "/login",
  validator("json", async (value, ctx) => {
    const username = value.username;
    const password = value.password;

    if (
      typeof username !== "string" ||
      username.length < 3 ||
      !passwordSchema.validate(password)
    ) {
      return ctx.text("Invalid!", 400);
    }

    const user = await prisma.user.findMany({ where: { username: username } });

    if (!user[0]) {
      return ctx.text("Invalid!", 400);
    } else {
      if ((await Bun.password.verify(password, user[0].password)) === false) {
        return ctx.text("Password didn't match!");
      }
    }
    const userId = user[0].id;
    const email = user[0].email;
    const key = username + user[0].encryptionKey + password;

    const payload = {
      id: userId,
      username: username,
      key: key
    };

    const jwtSecret = process.env.JWT_SECRET || ""
    const accessToken = await sign(payload, jwtSecret);

    if (email) {
      return ctx.json(
        {
          success: true,
          data: {
            username,
            email,
            accessToken,
          },
        },
        200,
      );
    }
    return ctx.json(
      {
        success: true,
        data: {
          username,
          accessToken,
        },
      },
      200,
    );
  }),
);

export default app;
