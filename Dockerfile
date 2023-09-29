# Use the "oven/bun" base image
FROM oven/bun

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and bun.lockb files
COPY package*.json bun.lockb ./

# Install Bun globally
RUN npm install -g bun

# Install project dependencies including Prisma
RUN bun install

# Copy the rest of the application code
COPY . .

# Set the NODE_ENV environment variable
ENV NODE_ENV production

# Start your Bun application
CMD [ "bun", "src/index.ts" ]

