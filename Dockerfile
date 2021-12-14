from node:10
WORKDIR /app

COPY package*.json ./

# install all the npm packages
RUN npm ci
RUN npm install -g ionic@4.1.2 cordova@8.1.2

# Bundle app source
COPY . .

EXPOSE 8100
CMD [ "npm", "run", "start:qa" ]