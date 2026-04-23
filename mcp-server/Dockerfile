FROM node:20

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 8000

CMD ["pnpm", "start"]
