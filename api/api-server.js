require('dotenv').config();
const express = require('express');
const { auth, requiredScopes } = require('express-oauth2-bearer');
const http = require('http');
const axios = require('axios').default
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require("express-jwt-authz");

const appUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;

const app = express();
app.use(auth());


let clientObjList = [];
async function loadMgmtAPIData() { 
  try {
    const mgmtToken = process.env.API_KEY;
    
    const allClients = await axios.get(`${process.env.ISSUER_BASE_URL}/api/v2/clients`, {
      headers: { authorization: 'Bearer ' + mgmtToken }
    }).then((res) => {
      return res.data;
    });

    const allActions = await axios.get(`${process.env.ISSUER_BASE_URL}/api/v2/actions/actions`, {
      headers: { authorization: 'Bearer ' + mgmtToken }
    }).then((res) => {
      return res.data;
    });

    matchActionsAndClients(allClients, allActions);
  } catch (err) {
    console.log(err);
  }
}

const matchActionsAndClients = (clients, actions) => {
  clients.forEach(client => {
    const singleClient = {name: client.name, id: client.client_id, actions: []};
    clientObjList.push(singleClient);
  });
  for (let i = 0; i < actions.total; i++){
    clientObjList.forEach(client => {
      if (actions.actions[i].code.includes(client.id)){
        client.actions.push(actions.actions[i].name, actions.actions[i].id, actions.actions[i].supported_triggers[0].id);
      }
    })
  }
  console.log("clientObjList", clientObjList);
}

// const authorizeAccessToken = jwt.expressjwt({
//   secret: jwksRsa.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: `${process.env.ISSUER_BASE_URL}/.well-known/jwks.json`
//   }),
//   audience: process.env.ALLOWED_AUDIENCES,
//   issuer: `${process.env.ISSUER_BASE_URL}/`,
//   algorithms: ["RS256"]
// });

// const checkPermissions = jwtAuthz(["read:reports", "read:appointments"], {
//   customScopeKey: "permissions",
//   checkAllScopes: true
// });

app.get('/', /*authorizeAccessToken, checkPermissions,*/ (req, res) => {
  loadMgmtAPIData();
  res.send(
    clientObjList
  );
  clientObjList = [];
});

http.createServer(app).listen(process.env.PORT, () => {
  console.log(`listening on ${appUrl}`);
});
