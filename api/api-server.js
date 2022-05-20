require('dotenv').config();
const express = require('express');
const { auth, requiredScopes } = require('express-oauth2-bearer');
const http = require('http');
const axios = require('axios').default

const appUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;

const app = express();
app.use(auth());


let clientObjList = [];
async function loadMgmtAPIData() { //Might need to add API Token param back in
  try {
    const mgmtToken = process.env.API_KEY;
    
    const allClients = await axios.get('https://dev-xmsvtht0.us.auth0.com/api/v2/clients', {
      //method: 'GET',
      headers: { authorization: 'Bearer ' + mgmtToken }
    }).then((res) => {
      return res.data;
    });

    const allActions = await axios.get('https://dev-xmsvtht0.us.auth0.com/api/v2/actions/actions', {
      //method: 'GET',
      headers: { authorization: 'Bearer ' + mgmtToken }
    }).then((res) => {
      // res.forEach(action => {

      // })
     // console.log(res.data);
      return res.data;
    });

    const actions = allActions;
    matchActionsAndClients(allClients, allActions);
    //console.log("clientObjList", clientObjList.length);
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
        //console.log("actions console log", actions.actions[i]);
        client.actions.push(actions.actions[i].name, actions.actions[i].id, actions.actions[i].supported_triggers[0].id);
      }
    })
  }
  console.log("clientObjList", clientObjList);
}


app.get('/', requiredScopes('read:reports'), (req, res) => {
  loadMgmtAPIData();
  res.send(
    clientObjList
  );
  clientObjList = [];
});

http.createServer(app).listen(process.env.PORT, () => {
  console.log(`listening on ${appUrl}`);
});
