FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install --omit=dev
COPY . .
EXPOSE 4000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start", "--workspace", "backend"]
