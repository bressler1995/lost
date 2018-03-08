//server on the fly
var express = require('express');
// Create the app
var app = express();

var m_storage = [];
var user_reg = [];
var m_len = 1;

var game_progress = 0;
var progress_max = 3;
var obstacle_current = [0, 0, 0];
var obstacle_max = [2, 5, 7];

var contribution_storage = [];
var contribution_user = [];
var c_len = 1;

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 9000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Lost Application Listening at http://' + host + ':' + port);
}

app.use(express.static('public'));


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);

    for(i = 0; i < m_len;i++) {
      var data2 = {
        message_storage:m_storage[i],
        user_storage:user_reg[i]
      }

      io.to(socket.id).emit('message', data2);
    }

      var data3 = {
        g_progress:game_progress,
        o_current:obstacle_current[game_progress],
        o_max:obstacle_max[game_progress]
      }

      io.to(socket.id).emit('progress', data3);
    
    
    // MESSAGE EMISSIONS
    socket.on('message',
      function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received message by " + data.user_storage + ": " + data.message_storage);
        m_storage[m_len - 1] = data.message_storage;
        user_reg[m_len - 1] = data.user_storage;
        m_len++;

        // Send it to all other clients
        socket.broadcast.emit('message', data);

      }
    );

    //ACTION EMISSIONS
    socket.on('action',
      function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Contribution Recieved by:" + data.action_name + ": " + data.user_name);

        //I HAVE YET TO DECIDE IF I WANT TO STORE THIS, I THINK I ONLY WANT TO STORE GAME STATES IN CASE OF DISCONNECT
        contribution_storage[c_len - 1] = data.action_name;
        contribution_user[c_len - 1] = data.user_name;
        c_len++;

        if(game_progress + 1 <= progress_max) {
          if(obstacle_current[game_progress] < obstacle_max[game_progress]) {
            obstacle_current[game_progress] = obstacle_current[game_progress] + 1;
          } else {
            game_progress++;
          }
        } else {
          game_progress = 0;
          obstacle_current[0] = 0;
          obstacle_current[1] = 0;
          obstacle_current[2] = 0;
        } 

        console.log("Game Progress: " + game_progress);
        console.log("Current Obstacle: " + obstacle_current[game_progress] + "/" + obstacle_max[game_progress]);

        // Send it to all other clients
        socket.broadcast.emit('action', data);

      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);