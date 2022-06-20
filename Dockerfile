FROM node:16 AS projectBuilder
WORKDIR /dockerexample/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM node:16
WORKDIR /apiAssignment
COPY package*.json ./
RUN npm ci --only=production 
COPY --from=projectBuilder /dockerexample/src/app/dist ./dist
EXPOSE 3000
CMD [ "node", "dist/main" ]