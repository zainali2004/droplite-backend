# 1. Use official Node.js LTS image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
COPY . .
RUN ls ./prisma
# COPY package*.json ./
RUN npm install

# 4. Copy the rest of the application
# COPY . .

# 5. Generate Prisma client
RUN npx generate

# 6. Build the TypeScript code
RUN npm run build

# 8. Expose the port your app runs on
EXPOSE 3000

# 9. Start the app
CMD ["node", "dist/index.js"]
