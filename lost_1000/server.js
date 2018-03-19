//server on the fly
var express = require('express');
// Create the app
var app = express();

var m_storage = [];
var user_reg = [];
var m_len = 1;

var game_progress = 0;
var progress_max = 5;
var obstacle_current = [0, 0, 0, 0, 0];
var obstacle_max = [5, 3, 3, 3, 3];

var obstacle_uname = [];
var ou_current = 1;

var contribution_storage = [];
var contribution_user = [];
var contribution_session = [];

var c_len = 1;

var session_id = 0;

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
        o_current:JSON.stringify(obstacle_current),
        s_id:session_id,
        ou:JSON.stringify(obstacle_uname),
        ou_num: ou_current
      }

      io.to(socket.id).emit('progress', data3);

      var data4 = {
        c_name: JSON.stringify(contribution_user),
        c_sess: JSON.stringify(contribution_session),
        c_curr: c_len
      }

      io.to(socket.id).emit('gresult', data4);
    
    
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
        console.log("Contribution Recieved by " + data.user_name + ": " + data.action_name);
        console.log("SESSION: " + data.s_id);
        console.log("");

        //I HAVE YET TO DECIDE IF I WANT TO STORE THIS, I THINK I ONLY WANT TO STORE GAME STATES IN CASE OF DISCONNECT
        if(obstacle_current[game_progress] < obstacle_max[game_progress]) {
          contribution_user[c_len - 1] = data.user_name;
          contribution_session[c_len - 1] = data.session_id;
          c_len++;
        }

        if(game_progress + 1 <= progress_max) {
          if(obstacle_current[game_progress] < obstacle_max[game_progress]) {
            obstacle_current[game_progress] = obstacle_current[game_progress] + 1;

            obstacle_uname[ou_current - 1] = data.user_name;
            ou_current += 1;
          } else {

            for (var i=0; i < ou_current; i++) {
              obstacle_uname[i] = "";
            }

            ou_current = 1;

            game_progress++;
          }
        } else {
          game_progress = 0;
          for(var i = 0; i < progress_max; i++) {
            obstacle_current[i] = 0;
          }

          for(var i = 0; i < c_len; i++) {
            contribution_user[i] = "";
            contribution_session[i] = 0;
          }

          c_len = 1;
        } 

        if (game_progress == progress_max) {
          console.log("Game Complete");
          console.log(JSON.stringify(obstacle_uname));
          session_id += 1;
          c_len--;
        } else {
          console.log("Game Progress: " + game_progress);
          console.log("Current Obstacle: " + obstacle_current[game_progress] + "/" + obstacle_max[game_progress]);
          console.log("Session ID: " + session_id);
          console.log(JSON.stringify(obstacle_uname));
        }
        

        // Send it to all other clients
        socket.broadcast.emit('action', data);
        
      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);