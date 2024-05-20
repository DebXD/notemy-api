import { OpenAPIHono, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

const swagger = new OpenAPIHono();

swagger.openAPIRegistry.registerPath({
	method: "post",
	path: "/register",
	tags: ["Users"],
	summary: "Create a new user",
	requestBody: {
		description: "User data",
		required: true,
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						username: { type: "string" },
						email: { type: "string" } || null,
						password: { type: "string" },
					},
					example: {
						username: "demouser",
						password: "Demo@1234",
					},
					required: ["username", "password"],
				},
			},
		},
	},
	responses: {
		200: {
			description: "Login Successful",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
					}),
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.string(),
					example: "Unauthorized",
				},
			},
		},
		409: {
			description: "Conflict",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),
					example: {
						success: false,
						message: "User Exists",
					},
				},
			},
		},
	},
});

swagger.openAPIRegistry.registerPath({
	method: "post",
	path: "/login",
	tags: ["Users"],
	summary: "User Login",
	requestBody: {
		description: "User data",
		required: true,
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						username: { type: "string" },
						password: { type: "string" },
					},
					example: {
						username: "demouser",
						password: "Demo@1234",
					},
					required: ["username", "password"],
				},
			},
		},
	},
	responses: {
		200: {
			description: "Login Successful",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						data: z.object({
							id: z.number(),
							username: z.string(),
							email: z.null() || z.string(),
							accessToken: z.string(),
							createdAt: z.string(),
							updatedAt: z.string(),
						}),
					}),
				},
			},
		},
		400: {
			description: "Bad Request",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),
					example: {
						success: false,
						message: "Malformed JSON in request body",
					},
				},
			},
		},
		404: {
			description: "Not Found",
			content: {
				"application/json": {
					schema: z.string(),
					example: "User does not exist",
				},
			},
		},

		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.string(),
					example: "Unauthorized",
				},
			},
		},
	},
});

// Example usage in a Swagger/OpenAPI definition
swagger.openAPIRegistry.registerPath({
	method: "get",
	path: "/me",
	tags: ["Users"],
	summary: "Get user details",
	security: [
		{
			Bearer: [],
		},
	],

	responses: {
		200: {
			description: "Request Successful",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						data: z.object({
							id: z.number(),
							username: z.string(),
							email: z.null() || z.string(),
							createdAt: z.string(),
							updatedAt: z.string(),
						}),
					}),
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.string(),

					example: "Unauthorized",
				},
			},
		},
	},
});

swagger.openAPIRegistry.registerPath({
	method: "get",
	path: "/notes",
	tags: ["Notes"],
	summary: "Get user all Notes",
	security: [
		{
			Bearer: [],
		},
	],

	responses: {
		200: {
			description: "Note Fetch Successful",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						data: z.array(
							z.object({
								title: z.string(),
								desc: z.string(),
								id: z.number(),
								createdAt: z.string(),
								updatedAt: z.string(),
								userId: z.number(),
							}),
						),
					}),
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.string(),
					example: "Unauthorized",
				},
			},
		},
	},
});

swagger.openAPIRegistry.registerPath({
	method: "post",
	path: "/notes",
	tags: ["Notes"],
	summary: "Add Note",
	security: [
		{
			Bearer: [],
		},
	],
	requestBody: {
		description: "User data",
		required: true,
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						title: { type: "string" },
						desc: { type: "string" },
					},
					example: {
						title: "this is a title",
						desc: "this is a desc",
					},
					required: ["title", "desc"],
				},
			},
		},
	},

	responses: {
		201: {
			description: "Note Created",

			content: {
				"application/json": {
					schema: z.object({
						created: z.boolean(),
						data: z.object({
							id: z.number(),
							title: z.string(),
							desc: z.string(),
							updatedAt: z.string(),
							createdAt: z.string(),
						}),
					}),
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.string(),
					example: "Unauthorized",
				},
			},
		},
		400: {
			description: "Bad Request",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),
					example: {
						success: false,
						message: "Malformed JSON in request body",
					},
				},
			},
		},
	},
});

swagger.openAPIRegistry.registerPath({
	method: "get",
	path: "/notes/{id}",
	tags: ["Notes"],
	summary: "Get Specific note",
	request: {
		params: z.object({
			id: z.string().openapi({ example: "1" }),
		}),
	},
	security: [
		{
			Bearer: [],
		},
	],

	responses: {
		200: {
			description: "Request Successful",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						data: z.object({
							id: z.number(),
							title: z.string(),
							desc: z.string(),
							createdAt: z.string(),
							updatedAt: z.string(),
							userId: z.number(),
						}),
					}),
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.string(),
					example: "Unauthorized",
				},
			},
		},

		404: {
			description: "Not Found",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),

					example: {
						success: false,
						message: "Invalid Note ID provided",
					},
				},
			},
		},
	},
});

swagger.openAPIRegistry.registerPath({
	method: "patch",
	path: "/notes/{id}",
	tags: ["Notes"],
	summary: "Update Note",
	request: {
		params: z.object({
			id: z.string().openapi({ example: "1" }),
		}),
	},
	security: [
		{
			Bearer: [],
		},
	],
	requestBody: {
		description: "User data",
		required: true,
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						title: { type: "string" },
						desc: { type: "string" },
					},
					example: {
						title: "this is a title",
						desc: "this is a desc",
					},
					required: ["title", "desc"],
				},
			},
		},
	},

	responses: {
		200: {
			description: "Request Successful",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						data: z.object({
							id: z.number(),
							title: z.string(),
							desc: z.string(),
							createdAt: z.string(),
							updatedAt: z.string(),
							userId: z.number(),
						}),
					}),
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.string(),
					example: "Unauthorized",
				},
			},
		},
		400: {
			description: "Bad Request",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),
					example: {
						success: false,
						message: "Malformed JSON in request body",
					},
				},
			},
		},

		404: {
			description: "Not Found",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),

					example: {
						success: false,
						message: "Invalid Note ID provided",
					},
				},
			},
		},
	},
});

swagger.openAPIRegistry.registerPath({
	method: "delete",
	path: "/notes/{id}",
	tags: ["Notes"],
	summary: "Delete Notes",
	request: {
		params: z.object({
			id: z.string().openapi({ example: "1" }),
		}),
	},
	security: [
		{
			Bearer: [],
		},
	],

	responses: {
		200: {
			description: "Request Successful",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),
					example: {
						success: true,
						message: "Note is deleted",
					},
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.string(),
					example: "Unauthorized",
				},
			},
		},

		404: {
			description: "Not Found",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),

					example: {
						success: false,
						message: "Note does not exist",
					},
				},
			},
		},
	},
});

swagger.get(
	"/",
	swaggerUI({
		url: "/docs",
	}),
);

swagger.doc("/docs", {
	info: {
		title: "Notemy API",
		version: "v1",
		description: "API OF NOTEMY",
		contact: {
			email: "debxd@duck.com",
			name: "Dev",
		},
	},
	servers: [
		{
			url: "/api/auth", // Set the base path here
			description: "Base API path",
		},
	],

	openapi: "3.1.0",
});
swagger.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
	type: "http",
	scheme: "bearer",
});

export default swagger;
