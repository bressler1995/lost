// Socket client end
var socket;

//universal variables
var winWidth;
var winHeight;

//input
var confInput;
var subOut;
var userInput;
var userSubmit;

//MENU OPT
var menu_button, how_button, about_button, log_button;
var menu_open = false;

//local storage
var m_current = 0;
var message_storage = [];
var user_reg = [];
var message_user = [];
var message_date = [];

var message_touched = [];
var message_touched_mobile = [];
var message_trans = [];
var message_posx = [];
var message_posy = [];

//Assets to import
var sounds = [];
var bg_store = [];
var bg_stages = [];

//misc
var sub_active = false;
var screen = 0;
var target_global = 0;

//user properties
var whoami = "Hop Hop";

//Game Progress
var game_progress = 0;
var progress_max = 5;
var obstacle_current = [0, 0, 0, 0, 0];
var obstacle_max = [5, 3, 3, 3, 3];
var session_id = 0;

var obstacle_uname = [];
var ou_current = 1;

//Character data
var character_chords = [
  [50, 100]
];

var character_size = [
  [120, 140]
];

//Obstacle Data
var obstacle_size = [
  [200, 200],
  [200, 200],
  [200, 200],
  [200, 200],
  [639, 600]
];

var obstacle_size_mobile = [
  [100, 100],
  [100, 100],
  [100, 100],
  [150, 150],
  [339, 400]
];


var obstacle_rock;
var rock_image = [];
var log_image = [];

var fire_image = [];
var fire_frame = 0;

var puma_image = [];
var puma_frame = 0;

var river_image = [];

//IDLE >> MOVING >> SCARED >> HAPPY
var char_display_state = 0;
var char_frame = 0;
var char_start = false;
var char_end = false;
var char_ready = false;
var start_tick = false;
var ease_mult = 0.08;

//char assets
var char_idle = [];
var char_moving = [];
var char_scared = [];
var char_happy = [];

//Environment Variables
var grass_height = 0;
var default_fps = 15;

function preload() {
  // sounds[0] = loadSound('assets/recieve.mp3');
  // sounds[0].setVolume(0.7);
  // sounds[1] = loadSound('assets/send.mp3');
  // sounds[1].setVolume(0.7);

  //Character
  for(var i = 0; i < 3; i++) {
    var real_number = i + 1;
    char_idle[i] = loadImage('assets/idle/' + real_number + '.png');
    char_moving[i] = loadImage('assets/moving/' + real_number + '.png');
    char_scared[i] = loadImage('assets/scared/' + real_number + '.png');
    char_happy[i] = loadImage('assets/happy/' + real_number + '.png');
  }

  //Backgrounds
  bg_store[0] = loadImage('assets/screen0.jpg');
  bg_store[1] = loadImage('assets/screen1.jpg');

  for (var i = 0; i < 6; i++) {
    var real_number = i +1;
    bg_stages[i] = loadImage('assets/background/bg' + real_number + '.jpg');
  }

  for (var i = 0; i < 4; i++) {
    var real_number = i +1;
    rock_image[i] = loadImage('assets/rocks/' + real_number + '.png');
  }

  for (var i = 0; i < 6; i++) {
    var real_number = i +1;
    fire_image[i] = loadImage('assets/fire/' + real_number + '.png');
  }

  for (var i = 0; i < 4; i++) {
    var real_number = i + 1;
    log_image[i] = loadImage('assets/logs/' + real_number + '.png');
  }

  for (var i = 0; i < 4; i++) {
    var real_number = i + 1;
    puma_image[i] = loadImage('assets/puma/' + real_number + '.png');
  }

  for (var i = 0; i < 4; i++) {
    var real_number = i + 1;
    river_image[i] = loadImage('assets/river/' + real_number + '.png');
  }

}

function setup() {
  frameRate(default_fps);
  //Load Character Images
  for (var i = 0; i < 3; i++) {
    char_idle[i].loadPixels();
    char_moving[i].loadPixels();
    char_scared[i].loadPixels();
    char_happy[i].loadPixels();
  }

  for(var i = 0; i < 6; i++) {
    bg_stages[i].loadPixels();
  }

  for (var i = 0; i < 4; i++) {
    rock_image[i].loadPixels();
  }

  for (var i = 0; i < 6; i++) {
    fire_image[i].loadPixels();
  }

  for (var i = 0; i < 4; i++) {
    log_image[i].loadPixels();
  }

  for (var i = 0; i < 4; i++) {
    puma_image[i].loadPixels();
  }

  for (var i = 0; i < 4; i++) {
    river_image[i].loadPixels();
  }

  //Load BG
  bg_store[0].loadPixels();
  bg_store[1].loadPixels();

  winWidth = windowWidth;
  winHeight = windowHeight;

  createCanvas(winWidth, winHeight);
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://localhost:9000');
  //socket = io.connect('http://ec2-54-193-21-43.us-west-1.compute.amazonaws.com:9000');
  
  // anonymous callback function
  socket.on('message',
    // When we receive data
    function(data) {
      if (data.message_storage != undefined) {
        console.log(data.user_storage + ": " + data.message_storage);
        message_storage[m_current] = data.message_storage;
        user_reg[m_current] = data.user_storage;
        //update any variables here
        m_current++;
      }
    }
  );

  socket.on('action',
    // When we receive data
    function(data) {      
        console.log("SIGNAL FROM " + data.user_name + ": " + data.action_name);
        console.log("SESSION: " + data.s_id);

        progress_sync();
        post_sync(data.user_name);
    }
  );

  socket.on('progress',
    // When we receive data
    function(data) {
        
        game_progress = data.g_progress;
        obstacle_current = JSON.parse(data.o_current);
        session_id = data.s_id;
        obstacle_uname = JSON.parse(data.ou);
        ou_current = data.ou_num;

        console.log("PROGRESS: " + game_progress);
        console.log("CURRENT OBSTACLE: " + obstacle_current[game_progress] + "/" + obstacle_max[game_progress]);
        console.log("Session ID: " + session_id);
      }
  );
  
  //Screen 1
  userInput = createInput();
  userSubmit = createButton("START PLAYING");

  //Main Game
  confInput = createInput('SAY SOMETHING!');
  subOut = createButton("ENTER");
  menu_button = createButton("");
  obstacle_rock = createButton("");

  //Menu Button on top of obstacle
  how_button = createButton("HOW TO");
  about_button = createButton("ABOUT");
  log_button = createButton("LOG");


  //Assign Mouse or Touch Events
  if(mobileAndTabletcheck) {
    subOut.touchEnded(sendmouse);
  } else {
    subOut.mousePressed(sendmouse);
  }

  //may need to mod later like sub out for mobile
  menu_button.mousePressed(open_menu);
  userSubmit.mousePressed(main_game);
  obstacle_rock.mousePressed(act);
  
  //FIRST SCREEN
  userInput.addClass("user_input")
  userSubmit.addClass("user_submit");

  //MAIN GAME
  confInput.addClass("message_input");
  subOut.addClass("sub_button");
  menu_button.addClass("menu_button");
  menu_button.addClass("closed");
  how_button.addClass("menu_opt_button");
  about_button.addClass("menu_opt_button");
  log_button.addClass("menu_opt_button");
  obstacle_rock.addClass("obstacle_rock");

  //IMPORTANT, THIS IS USED IN RESIZE AS WELL
  ui_execution();
}

function draw() {
  textFont('Helvetica');
  textStyle(NORMAL);
  noStroke();

  if (screen == 0) {
    

    background(0, 0, 0);

    if(winWidth >= 768) {
      var type_w = 350;
      var type_h = 20;
      var type_x = (winWidth / 2) - (type_w / 2);
      var type_y = winHeight - 150;

      image(bg_store[0], 0, 0, winWidth, winHeight);
      textSize(18);
      fill(0);
      textStyle(BOLD);
      text("What do you want your nickname to be?", type_x, type_y, type_w, type_h);
    } else {
      var type_w = 285;
      var type_h = 20;
      var type_x = (winWidth / 2) - (type_w / 2);
      var type_y = winHeight - 130;

      image(bg_store[1], 0, 0, winWidth, winHeight);
      textSize(14);
      fill(0);
      textStyle(BOLD);
      text("What do you want your nickname to be?", type_x, type_y, type_w, type_h);
    }
    

  } else if(screen == 1) {
    background(152, 227, 224);
    image(bg_stages[game_progress], 0, 0, winWidth, winHeight);

    //chat stuff here
    var inline_mobile = 0;
    
    if(typeof message_storage[0] !== 'undefined') {
      if (winWidth >= 768) {

        if(message_storage.length >= 3) {
          for(var i = message_storage.length - 3; i < message_storage.length; i++) {
            if(message_touched[i] != true) {
              message_trans[i] = 0;
              message_posx[i] = random(0, winWidth - 250);
              message_posy[i] = random(150, winHeight - 270);
              message_touched[i] = true;
            }

            if(message_trans[i] < 150) {
              message_trans[i] += 20;
            }
            
            fill(0, 0, 0, message_trans[i]);
            rect(message_posx[i], message_posy[i], 250, 120);
            fill(255);
            textStyle(BOLD);
            textSize(14);
            text(user_reg[i] + ": " + message_storage[i], message_posx[i] + 20, message_posy[i] + 20, 220, 100);
          }
        } else {
          for(var i = 0; i < message_storage.length; i++) {
            if(message_touched[i] != true) {
              message_trans[i] = 0;
              message_posx[i] = random(0, winWidth - 250);
              message_posy[i] = random(150, winHeight - 270);
              message_touched[i] = true;
            }

            if(message_trans[i] < 150) {
              message_trans[i] += 20;
            }
            
            fill(0, 0, 0, message_trans[i]);
            rect(message_posx[i], message_posy[i], 250, 120);
            fill(255);
            textStyle(BOLD);
            textSize(14);
            text(user_reg[i] + ": " + message_storage[i], message_posx[i] + 20, message_posy[i] + 20, 220, 100);
          }
        }
        
      } else {
        if(message_storage.length >= 3) {
          for(var i = message_storage.length - 1; i > message_storage.length - 4; i--) {

            if(message_touched_mobile[i] != true) {
              message_trans[i] = 0;
              message_touched_mobile[i] = true;
            }

            var mobile_x = 20;
            var mobile_y = (inline_mobile * 40) + 130;

            if(message_trans[i] < 150) {
              message_trans[i] += 20;
            }
            
            fill(0, 0, 0, message_trans[i]);
            rect(mobile_x, mobile_y, winWidth * 0.92, 30);
            fill(255);
            textStyle(BOLD);
            textSize(14);
            text(user_reg[i] + ": " + message_storage[i], mobile_x + 10, mobile_y + 10, 220, 20);

            inline_mobile++;
          }
        } else {
          for(var i = message_storage.length - 1; i > -1; i--) {

            if(message_touched_mobile[i] != true) {
              message_trans[i] = 0;
              message_touched_mobile[i] = true;
            }

            var mobile_x = 20;
            var mobile_y = (inline_mobile * 40) + 130;

            if(message_trans[i] < 150) {
              message_trans[i] += 20;
            }
            
            fill(0, 0, 0, message_trans[i]);
            rect(mobile_x, mobile_y, winWidth * 0.92, 30);
            fill(255);
            textStyle(BOLD);
            textSize(14);
            text(user_reg[i] + ": " + message_storage[i], mobile_x + 10, mobile_y + 10, 220, 20);

            inline_mobile++;
          }
        }
      }
    }
    
    //Non DOM based UI Stuff Here
    fill(115, 198, 82);
    var target_temporary = 0;
    var temp_image;

    if (char_frame < 3) {
      if(char_display_state == 0) {
        temp_image = char_idle[char_frame];
      } else if(char_display_state == 1) {
        temp_image = char_moving[char_frame];
      } else if(char_display_state == 2) {
        temp_image = char_scared[char_frame];
      } else if(char_display_state == 3) {
        temp_image = char_happy[char_frame];
      }
      
      char_frame++;
      
      if (char_frame == 3) {
        char_frame = 0;
      }
    }

    if (char_start == false) {
      if(winWidth >= 768) {
        grass_height = 30;
        character_size[0][0] = 120;
        character_size[0][1] = 140;
      } else {
        grass_height = 30;
        character_size[0][0] = 70;
        character_size[0][1] = 90;
      }

      if (start_tick == false) {
        setTimeout(function(){ char_start = true }, 1500);
        start_tick = true;
      }
      
    } else {
      if(winWidth >= 768) {
        grass_height = 30;
        character_size[0][0] = 120;
        character_size[0][1] = 140;
        target_temporary = winWidth - character_size[0][0] - 400; 
      } else {
        grass_height = 30;
        character_size[0][0] = 70;
        character_size[0][1] = 90;
        target_temporary = winWidth - character_size[0][0] - 140;
      }
    } 

    character_chords[0][1] = winHeight - grass_height - character_size[0][1];

    char_end = false;

    if(character_chords[0][0] < target_temporary - 30) {
      character_ease(target_temporary);
      char_display_state = 1;
      char_ready = false;
    } else if(character_chords[0][0] > target_temporary) {
      character_chords[0][0] = target_temporary;  
    } else {
      if(char_start == true) {
        if (obstacle_current[game_progress] == obstacle_max[game_progress]) {
          char_display_state = 3;
          char_ready = true;
          char_end = true;
        } else {
          char_display_state = 2;
          char_ready = true;
        }
      } else {
        char_ready = false;
        char_display_state = 0;
      }
     
    }

    obstacle_generate();
  
    fill(255, 255, 255, 220);
    if(winWidth >= 768) {
      rect(winWidth - 210, winHeight - 60, 200, 50);
      fill(0);
      textSize(14);
      textStyle(BOLD);
      text("jennjunseo.com/Lost", winWidth - 180, winHeight - 30);
    } else {
      rect(winWidth - 210, winHeight - 40, 200, 30);
      fill(0);
      textSize(14);
      textStyle(BOLD);
      text("jennjunseo.com/Lost", winWidth - 180, winHeight - 20);
    }   

    //game progression stuff here
    if (obstacle_current[game_progress] == obstacle_max[game_progress] && char_end == true) {
      if(winWidth >= 768) {
        image(temp_image, character_chords[0][0], character_chords[0][1] - 30, 160, 180);
      } else {
        image(temp_image, character_chords[0][0], character_chords[0][1] - 30, 100, 120);
      }
    } else {
      image(temp_image, character_chords[0][0], character_chords[0][1], character_size[0][0], character_size[0][1]);
    }
    
  }

}

function windowResized() {
  winWidth = windowWidth;
  winHeight = windowHeight;
  resizeCanvas(winWidth, winHeight);

  ui_execution();
}

function keyPressed() {
  if(keyCode == ENTER && screen == 0) {
    main_game();
  } else if(keyCode == ENTER && screen == 1) {
    sendmouse();
    //act();
  }
}

function touchEnded() {
  if (sub_active) {
    sub_active = false;
    return false;
  }
}

// Function for sending to the socket
function sendmouse() {
    sub_active = true;
    if(confInput.value() != "") {
      // Make a little object with  and y
      var data = {
        user_storage:whoami,
        message_storage: confInput.value()
      };
      
      console.log(data.message_storage);
      // Send that object to the socket
      socket.emit('message', data);
      confInput.value('');
      message_storage[m_current] = data.message_storage;
      user_reg[m_current] = data.user_storage;
      //update any other variables here like user name
      m_current++;
    } else {
      alert("Type something in the box!")
    }

}

window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function ui_execution() {
  //UI execution controls essentially all of the DOM elements
  //Draw will take care of p5 canvas elements

  if (screen == 0) {
    //disable controls from main game
    confInput.position(0 - winWidth, 0 - winHeight);
    subOut.position(-1000, -1000);
    menu_button.position(-100, -100);

    how_button.position(-100, -100);
    about_button.position(-100, -100);
    log_button.position(-100, -100);

    obstacle_rock.position(-1000, -1000);

    if (winWidth < 768) {
      userInput.position((winWidth / 2) - ((winWidth / 2) * 0.9), winHeight - 100);
      userSubmit.position((winWidth / 2) - ((winWidth / 2) * 0.9), winHeight - 50);
    } else {
      userInput.position((winWidth / 2) - (350 / 2), winHeight - 120);
      userSubmit.position((winWidth / 2) - (350 / 2), winHeight - 70);
    }
    
  } else if(screen == 1) {
    //disable controls from screen 1
    userInput.position(0 - winWidth, 0 - winHeight);
    userSubmit.position(0 - winWidth, 0 - winHeight);

    if(winWidth < 768) {
      var calcwidth = (winWidth / 2) - ((winWidth * 0.9) / 2) + 120;
      confInput.position(calcwidth, 20);
      subOut.position(calcwidth, 70);
      menu_button.position(15, 20);
      obstacle_rock.position(0, 150);
  
      if(menu_open == false) {
        how_button.position(-100, -100);
        about_button.position(-100, -100);
        log_button.position(-100, -100);
      } else {
        var mobile_pos = (winWidth / 2) - ((winWidth * 0.92) / 2);
        how_button.position(mobile_pos, 130);
        about_button.position(mobile_pos, 160);
        log_button.position(mobile_pos, 190);
      }
    } else {
      confInput.position(winWidth - (winWidth * 0.4) - 20, 20);
      subOut.position(winWidth - (winWidth * 0.4) - 20, 70);
      menu_button.position(20, 20);
      obstacle_rock.position(winWidth - 600, 150);
  
      if(menu_open == false) {
        how_button.position(-100, -100);
        about_button.position(-100, -100);
        log_button.position(-100, -100);
      } else {
        how_button.position(20, 85);
        about_button.position(20, 115);
        log_button.position(20, 145);
      }
    }
  }

}

function open_menu() {
  if(screen == 1) {
    if(menu_open == true) {
      menu_open = false;
      menu_button.removeClass("opened");
      menu_button.addClass("closed");
      ui_execution();
    } else {
      menu_open = true;
      menu_button.removeClass("closed");
      menu_button.addClass("opened");
      ui_execution();
    }
  }
}

function main_game() {
  if(userInput.value() != "") {
    whoami = userInput.value();
    alert("Have fun " + whoami + "!");
    screen = 1;
    ui_execution();
  } else {
    alert("Nickname can't be blank!");
  }
  
}

function act() {
      if(char_ready == true || (game_progress == progress_max)) {
        // Make a little object with  and y
        var data = {
          action_name:"DEFAULT ACTION",
          user_name: whoami,
          s_id: session_id
        };
        
        console.log("Sending action to server...");
        // Send that object to the socket
        socket.emit('action', data);
        progress_sync();
        post_sync(data.user_name);
      } else {
        console.log("not ready...");
      }
      
}

//SYNC GAME PROGRESS
function progress_sync() {
  if(game_progress + 1 <= progress_max) {
    if(obstacle_current[game_progress] < obstacle_max[game_progress]) {
      obstacle_current[game_progress] = obstacle_current[game_progress] + 1;
    } else {

      game_progress++;
      char_display_state = 0;
      char_frame = 0;
      char_start = false;
      char_end = false;
      char_ready = false;
      start_tick = false;
      character_chords[0][0] = 50;
      fire_frame = 0;
      puma_frame = 0;
    }
  } else {
    game_progress = 0;
    for(var i = 0; i < progress_max; i++) {
      obstacle_current[i] = 0;
    }
    
  }
  
  if (game_progress == progress_max) {
    console.log("Game Complete");
    session_id += 1;
  } else {
    console.log("Game Progress: " + game_progress);
    console.log("Current Obstacle: " + obstacle_current[game_progress] + "/" + obstacle_max[game_progress]);
    console.log("Session ID: " + session_id);
  }
}

//SYNC RELEVANT CONTRIBUTORS
function post_sync(name_param) {
  obstacle_uname[ou_current - 1] = name_param;
  ou_current += 1;
  
  if(obstacle_current[game_progress] == obstacle_max[game_progress]) {
        
    ou_current -= 1;
    var name_composition = "";
    for (var i = 0; i < ou_current; i++) {
      name_composition = name_composition + obstacle_uname[i] + ",";
    }

    alert("obstacle cleared by: " + name_composition);

    for (var i=0; i < ou_current; i++) {
      obstacle_uname[i] = "";
    }
    
    ou_current = 1;
  }
}

function character_ease(target) {
  var targetX = target;
  var dx = targetX - character_chords[0][0];
  character_chords[0][0] += dx * ease_mult;
}

function obstacle_generate() {

    if(game_progress == 0) {
      var dy_width = obstacle_size[0][0];
      var dy_height = obstacle_size[0][1];

      if (winWidth < 768) {
        dy_width = obstacle_size_mobile[0][0];
        dy_height = obstacle_size_mobile[0][1];
      }

      var d_x = winWidth - dy_width;
      var d_y = winHeight - dy_height - grass_height;
      var disp_text = "TAP FIRE"

      if (obstacle_current[game_progress] > 0) {
        disp_text = "Helpers needed: " + obstacle_current[game_progress] + "/" + obstacle_max[game_progress];
      }

      textStyle(BOLD);
      fill(255);

      if(winWidth < 768) {
        textSize(18);
        text(disp_text, random(15 - 5, 15 + 5), random(d_y - 25 - 5, d_y - 25 + 5));
      } else {
        textSize(24);
        text(disp_text, random(d_x - 50 - 5, d_x - 50 + 5), random(d_y - 25 - 5, d_y - 25 + 5));
      }
      

      if(obstacle_current[game_progress] < obstacle_max[game_progress]) {
        if(fire_frame < 3) {
          image(fire_image[fire_frame], d_x - 50, d_y - 15, dy_width, dy_height);
          fire_frame ++;
  
          if(fire_frame == 3) {
            fire_frame = 0;
          }
        }
      } else {
        if(fire_frame < 3) {
          fire_frame = 3;
        }

        if(fire_frame < 5) {
          fire_frame ++;
        }

        image(fire_image[fire_frame], d_x - 50, d_y - 15, dy_width, dy_height);

      }
      
      
    } else if(game_progress == 1) {
      var dy_width = obstacle_size[1][0];
      var dy_height = obstacle_size[1][1];

      if (winWidth < 768) {
        dy_width = obstacle_size_mobile[1][0];
        dy_height = obstacle_size_mobile[1][1];
      }

      var d_x = winWidth - dy_width;
      var d_y = winHeight - dy_height - grass_height;
      var disp_text = "TAP ROCK"

      if (obstacle_current[game_progress] > 0) {
        disp_text = "Helpers needed: " + obstacle_current[game_progress] + "/" + obstacle_max[game_progress];
      }

      textStyle(BOLD);
      fill(255);

      if(winWidth < 768) {
        textSize(18);
        text(disp_text, random(15 - 5, 15 + 5), random(d_y - 25 - 5, d_y - 25 + 5));
      } else {
        textSize(24);
        text(disp_text, random(d_x - 75 - 5, d_x - 75 + 5), random(d_y - 25 - 5, d_y - 25 + 5));
      }
      
      image(rock_image[obstacle_current[game_progress]], d_x - 50, d_y - 15, dy_width, dy_height);
    
    } else if(game_progress == 2) {
      var dy_width = obstacle_size[2][0];
      var dy_height = obstacle_size[2][1];

      if (winWidth < 768) {
        dy_width = obstacle_size_mobile[2][0];
        dy_height = obstacle_size_mobile[2][1];
      }

      var d_x = winWidth - dy_width;
      var d_y = winHeight - dy_height - grass_height;
      var disp_text = "TAP LOGS"

      if (obstacle_current[game_progress] > 0) {
        disp_text = "Helpers needed: " + obstacle_current[game_progress] + "/" + obstacle_max[game_progress];
      }

      textStyle(BOLD);
      fill(255);

      if(winWidth < 768) {
        textSize(18);
        text(disp_text, random(15 - 5, 15 + 5), random(d_y - 25 - 5, d_y - 25 + 5));
      } else {
        textSize(24);
        text(disp_text, random(d_x - 65 - 5, d_x - 65 + 5), random(d_y - 25 - 5, d_y - 25 + 5));
      }
      
      image(log_image[obstacle_current[game_progress]], d_x - 50, d_y - 15, dy_width, dy_height);
    } else if(game_progress == 3) {
      var dy_width = obstacle_size[3][0];
      var dy_height = obstacle_size[3][1];

      if (winWidth < 768) {
        dy_width = obstacle_size_mobile[3][0];
        dy_height = obstacle_size_mobile[3][1];
      }

      var d_x = winWidth - dy_width;
      var d_y = winHeight - dy_height - grass_height;
      var disp_text = "TAP PUMA"

      if (obstacle_current[game_progress] > 0) {
        disp_text = "Helpers needed: " + obstacle_current[game_progress] + "/" + obstacle_max[game_progress];
      }

      textStyle(BOLD);
      fill(255);
      
      if(winWidth < 768) {
        textSize(18);
        text(disp_text, random(15 - 5, 15 + 5), random(d_y - 25 - 5, d_y - 25 + 5));
      } else {
        textSize(24);
        text(disp_text, random(d_x - 75 - 5, d_x - 75 + 5), random(d_y - 25 - 5, d_y - 25 + 5));
      }

      if(obstacle_current[game_progress] < obstacle_max[game_progress]) {
        if(puma_frame < 3) {
          image(puma_image[puma_frame], d_x - 50, d_y - 15, dy_width, dy_height);
          puma_frame ++;
  
          if(puma_frame == 3) {
            puma_frame = 0;
          }
        }
      } else {

        image(puma_image[3], d_x - 50, d_y - 15, dy_width, dy_height);

      }

    } else if(game_progress == 4) {
      var dy_width = obstacle_size[4][0];
      var dy_height = obstacle_size[4][1];

      if (winWidth < 768) {
        dy_width = obstacle_size_mobile[4][0];
        dy_height = obstacle_size_mobile[4][1];
      }

      var d_x = winWidth - dy_width;
      var d_y = winHeight - dy_height;
      var t_x = winWidth - 350;
      var t_y = winHeight - grass_height - 100;
      var disp_text = "TAP ME"

      if (obstacle_current[game_progress] > 0) {
        disp_text = "Helpers needed: " + obstacle_current[game_progress] + "/" + obstacle_max[game_progress];
      }

      textStyle(BOLD);
      fill(255);

      if(winWidth < 768) {
        textSize(18);
        text(disp_text, random(15 - 5, 15 + 5), random(t_y - 5, t_y + 5));
      } else {
        textSize(24);
        text(disp_text, random(t_x - 5, t_x + 5), random(t_y - 5, t_y + 5));
      }
      
      image(river_image[obstacle_current[game_progress]], d_x + 70, d_y + 20, dy_width, dy_height);
    
    }

}