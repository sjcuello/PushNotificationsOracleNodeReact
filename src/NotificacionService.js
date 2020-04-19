const { Expo } = require('expo-server-sdk');
let express = require('express');
let { createPool } = require('./connectionPool.js');
var app = express();
var connPool;

let expo = new Expo();

async function doselect(pid) {
  return new Promise(function(resolve,reject){
    connPool.execute(
      'SELECT token FROM empresa WHERE id = : id', {
        id: pid
      }, {},
      function (err, result) {

        if (err) {
          console.error(err.message);
          reject(err.message);
        }

        resolve(result.rows);
      });
  });
};

async function pushNoti(pid,pmsg) {

  let messages = [];

  let vrows = await doselect(pid);
  
  let somePushTokens = []; 

  vrows.forEach(row => {
    somePushTokens.push(row[0]);
  });

  for (let pushToken of somePushTokens) {

    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    messages.push({
      to: pushToken,
      sound: 'default', // Only for IOS
      body: pmsg,
      data: {
        type: 'newNoti'
      },
      priority: 'high'
    })
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);

      tickets.push(ticketChunk);
    } catch (error) {
      console.error('error: ', error);
    }
  }
  
}

/**
 * Express
 */

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

/* http://localhost:3400/push
** Recibe un JSON como el siguiente:
** {
    "usuario_id": 201,
    "titulo": "titulo"
   }
*/

app.get('/push', function (req, res) {

  console.log("req.body.usuario_id: ", req.body.usuario_id);

  if (req.body.usua0100_id) {
    pushNoti(req.body.usuario_id, req.body.titulo);
  }

  return res.end();
});

(async function () {
  let new_pool;

  try {

    new_pool = await createPool();

    connPool = await new_pool.getConnection();

    app.listen(3400);

    console.log("Conected and Listening");  

  } catch (err) {
    console.error(err.message);
  }

})();