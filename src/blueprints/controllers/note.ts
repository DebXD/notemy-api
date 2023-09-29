import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { validator } from "hono/validator";
import { jwt, verify } from "hono/jwt";
import { decryptUserData, encryptUserData } from "../../utils/encryptData";
const app = new Hono();
const prisma = new PrismaClient();

app.use(
  "/*",
  jwt({
    secret: process.env.JWT_SECRET || "",
  }),
);

app.get("/", async (c: any) => {
  // console.log(c.req.header())
  const payload = c.get("jwtPayload");
  const userId = payload.id;
  const notes = await prisma.note.findMany({ where: { userId: userId } });
  const decryptedNotesList: any[] = [];
  const key = payload.key;
  notes.forEach((note) => {
    if (note.title && note.desc && key) {
      const decryptedNotes: Record<string, any> = {};
      const decryptedTitle = decryptUserData(note.title, key);
      const decryptedDesc = decryptUserData(note.desc, key);
      decryptedNotes.id = note.id;
      decryptedNotes.createdAt = note.createdAt;
      decryptedNotes.updatedAt = note.updatedAt;
      decryptedNotes.title = decryptedTitle;
      decryptedNotes.desc = decryptedDesc;
      decryptedNotes.userId = note.userId;
      decryptedNotesList.push(decryptedNotes);
    }
  });
  return c.json({ success: true, data: decryptedNotesList }, 200);
});

app.post(
  "/",
  validator("json", async (value, c) => {
    console.log(value);
    const payload = c.get("jwtPayload");
    const title = value.title;
    const desc = value.desc;
    if (title === "" && desc === "" ) {
      return c.json(
        { success: false, message: "Title and desc both can not be empty" },
        400,
      );
    }
    if (!title && !desc) {
      return c.json(
        { success: false, message: "No title, desc found in body" },
        400,
      );
    }
    const encTitle = encryptUserData(title, payload.key);
    const encDesc = encryptUserData(desc, payload.key);
    console.log(typeof encTitle);
    // create a new user
    await prisma.note.create({
      data: {
        title: encTitle,
        desc: encDesc,
        userId: payload.id,
      },
    });

    return c.json({ created: true, data: { title: title, desc: desc } }, 201);
  }),
);

app.get("/page", (c) => {
  const payload = c.get("jwtPayload");
  console.log(payload.id);
  return c.json(payload); // eg: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
});

export default app;
