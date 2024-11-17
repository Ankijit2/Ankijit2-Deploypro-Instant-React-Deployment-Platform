FROM node:20
WORKDIR /usr/src/app
RUN npm install -g pnpm
COPY package*.json ./ 
COPY pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build
CMD ["pnpm", "start"]