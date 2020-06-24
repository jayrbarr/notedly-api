require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const getUser = token => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Session invalid');
    }
  }
};

db.connect(DB_HOST);

app.get('/', (req, res) => res.send('Hello World!!!'));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization;
    const user = getUser(token);
    console.log(user);
    return { models, user };
  },
});

server.applyMiddleware({ app, path: '/api' });

app.listen(PORT, () =>
  console.log(`GraphQL Server running at http://localhost:${PORT}${server.graphqlPath}`)
);
