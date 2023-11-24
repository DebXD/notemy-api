import { Context, Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { jwt } from "hono/jwt";
import { decryptUserData, encryptUserData } from "../../../utils/encryptData";
const app = new Hono();
const prisma = new PrismaClient();
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import getRedisClient from "../../../utils/redisClient";

// This middleware gives this app instance protected route, and to check if jwt token valid or not
app.use(
	"/*",
	jwt({
		secret: process.env.JWT_SECRET || "",
	}),
);

const redis = getRedisClient();

if (!redis) {
	console.log("couldn't found redis client");
}
app.get("/", async (c: Context) => {
	// console.log(c.req.header())
	const payload = c.get("jwtPayload");
	const userId = payload.id;
	try {
		if (redis) {
			try {
				console.log("Fetching from redis");
				const cache = await redis.get(payload.username + c.req.path);
				console.log(c.req.path);
				if (cache) {
					console.log(cache);
					const data = JSON.parse(cache);
					return c.json({ success: true, data });
				} else {
					throw new Error();
				}
			} catch (err) {
				console.log("fetching from db");
				const notes = await prisma.note.findMany({
					where: { userId: userId },
					orderBy: {
						id: "asc",
					},
				});
				const decryptedNotesList: any[] = [];
				const key = payload.key;
				notes.forEach((note) => {
					if (note.title && note.desc && key) {
						const decryptedNotes: Record<string, any> = {};
						decryptedNotes.title = decryptUserData(note.title, key);
						decryptedNotes.desc = decryptUserData(note.desc, key);
						decryptedNotes.id = note.id;
						decryptedNotes.createdAt = note.createdAt;
						decryptedNotes.updatedAt = note.updatedAt;
						decryptedNotes.userId = note.userId;
						decryptedNotesList.push(decryptedNotes);
					}
				});
				const json = JSON.stringify(decryptedNotesList);
				await redis.set(payload.username + c.req.path, json, "EX", 3600);
				console.log("notes value is set");

				return c.json({ success: true, data: decryptedNotesList }, 200);
			}
		}
	} catch (err: any) {
		return c.json({ success: false, message: err.message });
	}
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
	try {
		await prisma.note.create({
			data: {
				title: encTitle,
				desc: encDesc,
				userId: payload.id,
			},
		});
		try {
			//invalidate cache
			if (redis) {
				await redis.del(payload.username + c.req.path);
				await redis.del(payload.username, "/api/auth/notes");
			}
		} catch (err) {
			console.log(err);
			return c.json({ success: false, message: "failed to update cache" });
		}

		const data = await prisma.note.findFirst({
			orderBy: {
				id: "desc",
			},
		});
		return c.json(
			{
				created: true,
				data: {
					id: data?.id,
					title: title,
					desc: desc,
					createdAt: data?.createdAt,
					updatedAt: data?.updatedAt,
				},
			},
			201,
		);
	} catch (err: any) {
		return c.json({ success: false, message: err.message });
	}
});

const noteIdSchema = z.object({
	id: z.string().optional(),
});

//? get a specific Note
app.get("/:id", zValidator("param", noteIdSchema), async (c: any) => {
	const requestedNoteId = c.req.param().id;
	const payload = c.get("jwtPayload");
	const userId = payload.id;
	if (redis) {
		try {
			// console.log("trying to fetch from redis");
			const cache = await redis.get(payload.username + c.req.path);
			if (cache) {
				// console.log(cache);
				const data = JSON.parse(cache);
				return c.json({ success: true, data });
			} else {
				throw Error;
			}
		} catch (err: any) {
			try {
				// console.log("trying to fetch from db");
				if (requestedNoteId) {
					const note = await prisma.note.findMany({
						where: { userId: userId, id: parseInt(requestedNoteId) },
					});
					const decryptedNote: Record<string, any> = {};
					if (note[0].title && note[0].desc && payload.key) {
						decryptedNote.title = decryptUserData(note[0].title, payload.key);
						decryptedNote.desc = decryptUserData(note[0].desc, payload.key);
						decryptedNote.id = note[0].id;
						decryptedNote.createdAt = note[0].createdAt;
						decryptedNote.updatedAt = note[0].updatedAt;
						decryptedNote.userId = note[0].userId;
					}
					const json = JSON.stringify(decryptedNote);
					await redis.set(payload.username + c.req.path, json, "EX", 3600);
					// console.log("note value is set");

					return c.json({ success: true, data: decryptedNote }, 200);
				}
			} catch {
				return c.json(
					{ success: false, message: "Invalid Note ID provided" },
					404,
				);
			}
		}
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

				const updateNote = await prisma.note.update({
					where: {
						id: note[0].id,
					},
					data: {
						title: encTitle,
						desc: encDesc,
					},
				});
				if (updateNote) {
					//invalidate cache
					if (redis) {
						await redis.del(payload.username + c.req.path);
						await redis.del(payload.username, "/api/auth/notes");
						// console.log("deleted stored cache");
					}

					return c.json(
						{
							success: true,
							data: {
								id: note[0].id,
								title: title,
								desc: desc,
								createdAt: note[0].createdAt,
								updatedAt: note[0].updatedAt,
							},
						},
						200,
					);
				}
			}
		} catch {
			return c.json(
				{ success: false, message: "Invalid Note ID provided" },
				404,
			);
		}
	},
);

//? DELETE NOTE
app.delete("/:id", zValidator("query", noteIdSchema), async (c: any) => {
	const requestedNoteId = c.req.param().id;
	const payload = c.get("jwtPayload");
	const userId = payload.id;
	try {
		if (requestedNoteId) {
			const deleteUser = await prisma.note.delete({
				where: {
					id: parseInt(requestedNoteId),
					userId: userId,
				},
			});
			if (deleteUser) {
				//invalidate cache
				if (redis) {
					await redis.del(payload.username + c.req.path, (err, result) => {
						if (err) {
							console.error("Error deleting key:", err);
						} else {
							console.log(`Deleted ${result} key(s)`);
						}
					});

					await redis.del(payload.username, "/api/auth/notes");
					console.log("deleted stored cache");
				}

				return c.json({ success: true, message: "Note is deleted" }, 200);
			}
		}
	} catch (err: any) {
		return c.json({ success: false, message: " Note does not exist" }, 404);
	}
});

export default app;
