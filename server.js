const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Pusher = require('pusher');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const pusher = new Pusher({
  app_id: '705542',
  key : '46c9f1be32afa28af4a9',
  secret : '5f6750e3bef0744e4a25',
  cluster : 'us2',
  useTLS : true
});

app.use(express.static('./dist/'));

app.all('/*', function (request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "*");
  next();
});

// authentication endpoint
app.post('/pusher/auth', function (request, response) {
  let socketId = request.body.socketId;
  let channel = request.body.channel;
  let presenceData = {
    user_id : crypto.randomBytes(16).toString("hex")
  }
  let auth = pusher.authenticate(socketId, channel, presenceData);
  response.send(auth);
});

//direct all other requests to main page view
app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, './dist/index.html'))
});

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log('Listening on localhost:3000');
});