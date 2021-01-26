FROM  node:12
WORKDIR /haru
COPY package*.json ./
RUN npm install --slient
COPY . .
CMD ["npm","start"]
EXPOSE 3000