FROM node:12

COPY . /src

WORKDIR /src

RUN npm install --only=production
RUN npm install  typescript

EXPOSE 3000

CMD npm run dev