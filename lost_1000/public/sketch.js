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

var sounds = [];
var char_sprite = [];

//misc
var sub_active = false;
var screen = 0;
var target_global = 0;

//user properties
var whoami = "Hop Hop";

function preload() {
  // sounds[0] = loadSound('assets/recieve.mp3');
  // sounds[0].setVolume(0.7);
  // sounds[1] = loadSound('assets/send.mp3');
  // sounds[1].setVolume(0.7);

  char_sprite[0] = loadImage('assets/gumball_dad.png');
}

function setup() {
  //eventually iterate as assets become larger
  char_sprite[0].loadPixels();

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

  socket.on('progress',
    // When we receive data
    function(data) {
        console.log("PROGRESS: " + data.g_progress);
        console.log("CURRENT OBSTACLE: " + data.o_current + "/" + data.o_max);
    }
  );
  
  //Screen 1
  userInput = createInput();
  userSubmit = createButton("START PLAYING");

  //Main Game
  confInput = createInput('SAY SOMETHING!');
  subOut = createButton("ENTER");
  menu_button = createButton("");
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

  //IMPORTANT, THIS IS USED IN RESIZE AS WELL
  ui_execution();
}

function draw() {
  textFont('Helvetica');
  textStyle(NORMAL);
  noStroke();

  if (screen == 0) {
    var type_w = 340;
    var type_h = 20;
    var type_x = (winWidth / 2) - (type_w / 2);
    var type_y = (winHeight / 2) - (type_h / 2) - 40;

    background(0, 0, 0);
    textSize(18);
    fill(255);
    text("What do you want your nickname to be?", type_x, type_y, type_w, type_h);

  } else if(screen == 1) {
    background(152, 227, 224);

    //chat stuff here
    var inline_mobile = 0;

    if(typeof message_storage[0] !== 'undefined') {
      if (winWidth >= 768) {

        if(message_storage.length >= 5) {
          for(var i = message_storage.length - 5; i < message_storage.length; i++) {
            if(message_touched[i] != true) {
              message_trans[i] = 0;
              message_posx[i] = random(0, winWidth - 250);
              message_posy[i] = random(70, winHeight - 270);
              message_touched[i] = true;
            }

            if(message_trans[i] < 200) {
              message_trans[i] += 10;
            }
            
            fill(0, 0, 0, message_trans[i]);
            rect(message_posx[i], message_posy[i], 250, 120);
            fill(255);
            textSize(12);
            text(user_reg[i] + ": " + message_storage[i], message_posx[i] + 20, message_posy[i] + 20, 220, 100);
          }
        } else {
          for(var i = 0; i < message_storage.length; i++) {
            if(message_touched[i] != true) {
              message_trans[i] = 0;
              message_posx[i] = random(0, winWidth - 250);
              message_posy[i] = random(70, winHeight - 270);
              message_touched[i] = true;
            }

            if(message_trans[i] < 200) {
              message_trans[i] += 10;
            }
            
            fill(0, 0, 0, message_trans[i]);
            rect(message_posx[i], message_posy[i], 250, 120);
            fill(255);
            textSize(12);
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

            if(message_trans[i] < 200) {
              message_trans[i] += 10;
            }
            
            fill(0, 0, 0, message_trans[i]);
            rect(mobile_x, mobile_y, winWidth * 0.92, 30);
            fill(255);
            textSize(12);
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

            if(message_trans[i] < 200) {
              message_trans[i] += 10;
            }
            
            fill(0, 0, 0, message_trans[i]);
            rect(mobile_x, mobile_y, winWidth * 0.92, 30);
            fill(255);
            textSize(12);
            text(user_reg[i] + ": " + message_storage[i], mobile_x + 10, mobile_y + 10, 220, 20);

            inline_mobile++;
          }
        }
      }
    }
    
    //Non DOM based UI Stuff Here
    fill(115, 198, 82);
  
    if(winWidth >= 768) {
      rect(0, winHeight - 70, winWidth, 70);
    } else {
      rect(0, winHeight - 50, winWidth, 50);
    }
  
    fill(255);
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
    
    image(char_sprite[0], 30, winHeight - 120 - 70, 100, 120);
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


    if (winWidth < 768) {
      var uiny = (winHeight / 2) - (25 / 2);
      userInput.position((winWidth / 2) - ((winWidth / 2) * 0.9), uiny);
      userSubmit.position((winWidth / 2) - ((winWidth / 2) * 0.9), uiny + 50);
    } else {
      var uiny = (winHeight / 2) - (25 / 2);
      userInput.position((winWidth / 2) - (350 / 2), uiny);
      userSubmit.position((winWidth / 2) - (350 / 2), uiny + 50);
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
