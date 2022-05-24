const dotenv = require('dotenv')
const express = require('express');
const http = require('http');
const axios = require('axios').default
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const cors = require('cors');

const app = express();
dotenv.config()
app.use(express.json())
app.use(cors())

// Build config
const PORT = process.env.PORT || 8080;
const DOMAIN = process.env.DOMAIN
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const AUDIENCE = process.env.ALLOWED_AUDIENCES

// Validates JWT
const authorizeAccessToken = jwt.expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${DOMAIN}/.well-known/jwks.json`
  }),
  audience: `${AUDIENCE}`,
  issuer: `https://${DOMAIN}/`,
  algorithms: ["RS256"]
});

app.use(authorizeAccessToken);

app.get('/', authorizeAccessToken, async (req, res) => {

  // Formatting request for Management API token
  let options = {
    method: `POST`,
    url: `https://${DOMAIN}/oauth/token`,
    headers: {'content-type': 'application/json'},
    data: {
        grant_type: 'client_credentials',
        client_id: `${CLIENT_ID}`,
        client_secret: `${CLIENT_SECRET}`,
        audience: `https://${DOMAIN}/api/v2/`
    }
  }
  // Requesting Management API token
  const mgmtApiToken = await axios.request(options).then((res) => {
      return `Bearer ${res.data.access_token}`
  })

  // Retrieve all Clients in tenant
  const allClients = await axios.get(`https://${DOMAIN}/api/v2/clients`, {
    headers: { authorization: mgmtApiToken }
  }).then((res) => {
    return res.data;
  });

  // Retrieve all Actions in tenant
  const allActions = await axios.get(`https://${DOMAIN}/api/v2/actions/actions`, {
    headers: { authorization: mgmtApiToken }
  }).then((res) => {
    return res.data;
  });

  let clientObjList = [];
  
  // Match Actions with their Clients
  const matchActionsAndClients = (clients, actions) => {
    clients.forEach(client => {
      const singleClient = {name: client.name, id: client.client_id, actions: []};
      clientObjList.push(singleClient);
    });
    for (let i = 0; i < actions.total; i++){
      clientObjList.forEach(client => {
        if (actions.actions[i].code.includes(client.id)){
          client.actions.push({name: actions.actions[i].name, id: actions.actions[i].id, trigger: actions.actions[i].supported_triggers[0].id});
        }
      })
    }
  }
  matchActionsAndClients(allClients, allActions);

  // Return list of Clients and their matching Actions
  res.send(
    clientObjList
  );
  // Clear clientObjList in case the page is reloaded
  clientObjList = [];
});

http.createServer(app).listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
