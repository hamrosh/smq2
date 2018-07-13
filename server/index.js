import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const morgan = require('morgan');
const session = require('express-session');

const MongoStore = require('connect-mongo')(session);
const passport = require('./passport');
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import schema from './schema/schema';

// Route requires
const user = require('./routes/user');

// declaring the express app and the port to be used
const app = express();
const PORT = 5000;

// move this key to the config file later
const mongoURI = 'mongodb://localhost:27017/itigurus';

// Cors used for request from CLient App  in Local Development

app.use(cors());

// mongobd Connection and Setup

mongoose.connect(mongoURI);
mongoose.connection.once('open', () => {
  console.log('Connected to Database ');
});

// MIDDLEWARE
app.use(morgan('dev'));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// Sessions
app.use(
  session({
    secret: 'fraggle-wait', //pick a random string to make the hash that is generated secure
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false, //required
    saveUninitialized: false, //required
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365
    }
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session()); // calls the deserializeUser

// Routes
app.use('/user', user);
app.use('/images', express.static('images'));
// graphql
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress((req, res) => {
    return {
      schema: schema,
      context: {
        user: req.user
      }
      // other options here
    };
  })
);
app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:5000/subscriptions`
  })
);

// Starting the server on Port , usee the ENV.PORT varialble Later

app.use(express.static(`${__dirname}/../build`));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const ws = createServer(app);

ws.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${PORT}`);
  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema
    },
    {
      server: ws,
      path: '/subscriptions'
    }
  );
});
