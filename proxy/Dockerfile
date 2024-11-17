# Use Node.js base image
FROM node:20

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Build the TypeScript project
RUN pnpm run build

# Set the environment variable for production
ENV NODE_ENV=PRODUCTION

# Start the application using pnpm
CMD ["pnpm", "run", "start"]
