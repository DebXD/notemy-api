import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { validator } from "hono/validator";
import { jwt, verify } from "hono/jwt";
import { decryptUserData, encryptUserData } from "../../utils/encryptData";
const app = new Hono();
const prisma = new PrismaClient();
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
// This middleware gives this app instance protected route, and to check if jwt token valid or not
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

const noteSchema = z.object({
  title: z.string(),
  desc: z.string(),
});

app.post("/", zValidator("json", noteSchema), async (c) => {
  const data = c.req.valid("json");
  const payload = c.get("jwtPayload");
  const title = data.title;
  const desc = data.desc;
  if (title === "" && desc === "") {
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
});

const noteIdSchema = z.object({
  id: z.string().optional(),
});

//? get a specific Note
app.get("/:id", zValidator("param", noteIdSchema), async (c: any) => {
  const requestedNoteId = c.req.param().id;
  const payload = c.get("jwtPayload");
  const userId = payload.id;
  try {
    if (requestedNoteId) {
      const note = await prisma.note.findMany({
        where: { userId: userId, id: parseInt(requestedNoteId) },
      });
      const decryptedNote: Record<string, any> = {};
      if (note[0].title && note[0].desc && payload.key) {
        const decryptedNoteTitle = decryptUserData(note[0].title, payload.key);
        const decryptedNoteDesc = decryptUserData(note[0].desc, payload.key);
        decryptedNote.title = decryptedNoteTitle;
        decryptedNote.desc = decryptedNoteDesc;
        decryptedNote.id = note[0].id;
        decryptedNote.createdAt = note[0].createdAt;
        decryptedNote.updatedAt = note[0].updatedAt;
        decryptedNote.userId = note[0].userId;
      }

      return c.json(decryptedNote, 200);
    }
  } catch {
    return c.json({ success: false, message: "Invalid Note ID provided" }, 404);
  }
});

// Update Note

app.patch(
  "/:id",
  zValidator("json", noteSchema),
  zValidator("query", noteIdSchema),
  async (c) => {
    const requestedNoteId = c.req.param().id;
    const payload = c.get("jwtPayload");
    const userId = payload.id;
    const data = c.req.valid("json");
    const title = data.title;
    const desc = data.desc;
    if (title === "" && desc === "") {
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

    try {
      const note = await prisma.note.findMany({
        where: { userId: userId, id: parseInt(requestedNoteId) },
      });
      if (note[0].title && note[0].desc && payload.key) {
        const encTitle = encryptUserData(title, payload.key);
        const encDesc = encryptUserData(desc, payload.key);
        note[0].title = encTitle;
        note[0].desc = encDesc;

        try {
          const updateUser = await prisma.note.update({
            where: {
              id: note[0].id,
            },
            data: {
              title: encTitle,
              desc: encDesc,
            },
          });
          if (updateUser) {
            return c.json(
              {
                success: true,
                title: title,
                desc: desc,
              },
              201,
            );
          }
        } catch (Error: any) {
          return c.json({ success: false, message: Error.message }, 500);
        }

        return c.json(
          {
            created: true,
            data: {
              title: title,
              desc: desc,
            },
          },
          200,
        );
      }
    } catch {
      return c.json(
        { success: false, message: "Invalid Note ID provided" },
        404,
      );
    }
  },
);
app.delete("/:id", zValidator("query", noteIdSchema), async (c: any) => {
  const requestedNoteId = c.req.param().id;
  const payload = c.get("jwtPayload");
  const userId = payload.id;
  try{
    if(requestedNoteId){
      const deleteUser = await prisma.note.delete({
        where: {
          id: parseInt(requestedNoteId),
          userId : userId
        },
      })
      if(deleteUser){
        console.log(deleteUser)
        return c.json({success : true, message : "note is deleted"}, 204)
      }

    }

  }
  catch(Error: any){
    return c.json({success : false, message : Error.message})
  }
});

export default app;
