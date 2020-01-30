FROM node:12-alpine

RUN apk add postgresql-client
ADD . /app
WORKDIR /app
RUN npm install --only=prod

RUN chmod +x wait-for-postgres.sh
 
ENTRYPOINT [ "npm", "start" ]
