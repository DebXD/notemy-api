FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./
COPY src ./

RUN bun install

# Copy the rest of the application code
COPY . .

# Set the NODE_ENV environment variable
ENV NODE_ENV production

# Start your Bun application
CMD [ "bun", "src/index.ts" ]

