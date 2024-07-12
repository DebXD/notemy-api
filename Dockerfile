FROM oven/bun:latest

COPY --from=node:18 /usr/local/bin/node /usr/local/bin/node
COPY package.json ./
COPY bun.lockb ./
COPY src ./
COPY prisma ./

RUN bun install
RUN apt install wget
# generate prisma client
RUN bun run prisma generate
# Copy the rest of the application code
COPY . .

# Set the NODE_ENV environment variable
ENV NODE_ENV production

# Start your Bun application
CMD [ "bun", "src/index.ts" ]

