const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getUsers,
  setUser,
  counted,
  startCount,
  kill
} = require("./users.js");

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

const platforms = [];
var coins = [];
var spikes = [];
let colors = ["red", "white", "blue"];
const size = 20000;
let count = 0;
let americaMode = true;
function getRandomColor() {
  if(americaMode){
    count++;
    return colors[(count-1) % 3];
  }else {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

}
function generatePlatforms() {
  console.log("GEnerating...")
  let y = -size;
  while (y <size) {
    y += Math.random() * 25 + 75;
    let x = -size;
    let color = getRandomColor();
    while (x < size) {
      x += Math.random() * 200 + 100;
      let width = Math.random() * 200 + 100;
      const newPlatform = { x, y: y + 30 * Math.random(), width, height: 20, color}
      platforms.push(newPlatform);
      let choose = Math.random();
      if(choose < 0.333){
        for(let i=0; i < width/40; i++){
          coins.push({x: x+ 20 * i, y: newPlatform.y-20, width: 20, height: 20})
        }
      }else if(choose < 0.666666){
          spikes.push({x, y: newPlatform.y-20, width: 20, height: 20})
      }
      x += width;
    }
  }
}
generatePlatforms();

io.on("connect", (socket) => {
  //socket.emit("avaRooms", { rooms: getAvaRooms() });
  socket.on("joinRoom", ({ username, skin }) => {
    console.log("LOLLLL")
    userJoin(socket.id, username, skin);
    // console.log(platforms);
    // console.log(coins);
    // console.log(spikes);
    socket.emit("platforms", { myPlatform: platforms, myCoins: coins, mySpikes: spikes });
  });
  socket.on("youCanGiveMeUsers", () => {
    var users = getUsers();
    if(users.length == 1){
      io.emit("users", { users: getUsers() });
    }else {
      startCount();
      users.forEach((user) => {
        if (user.id != socket.id) {
          io.to(user.id).emit("getInfo");
        }
      });
    }
    

  });
  socket.on("disconnect", () => {
    const user = getCurrentUser(socket.id);
    if (user != undefined) {
      userLeave(socket.id);
      io.emit("users", { users: getUsers() });
    }
  });
  socket.on("theInfo", ({ x, y, xvel, xacc, yvel, yacc }) => {
    setUser({ id: socket.id, x, y, xvel, xacc, yvel, yacc });
    if (counted()) {
      io.emit("users", { users: getUsers() });
    }
  });
socket.on("changeValue", ({ x, y, xvel, xacc, yvel, yacc }) => {
  // update server-side state
  setUser({ id: socket.id, x, y, xvel, xacc, yvel, yacc });
  // broadcast the new state once to everyone (sender can ignore its own data)
  io.emit("changeIt", { id: socket.id, x, y, xvel, xacc, yvel, yacc });
});
  socket.on("coinAte", ({coin}) => {
    coins.splice(coin, 1);
    const users = getUsers();
    users.forEach((user) => {
      if (user.id != socket.id) {
        io.to(user.id).emit("deleteCoin", ({coin}))
      }
    });
  })

  socket.on("shoot", ({bullet}) => {
    const users = getUsers();
    users.forEach((user) => {
      if (user.id != socket.id) {
        io.to(user.id).emit("bullet", {bullet});
      }
    });
  })
  socket.on("chatMessage", ({ message }) => {
    const user = getCurrentUser(socket.id);
    io.emit("chatMessage", { message, user, time: Date.now() });
  });
  socket.on("startGame", () => {});

  socket.on("blowUp", ({ id, bulletId }) => {
     const user = getCurrentUser(socket.id)
    const victim = getCurrentUser(id)
    io.emit("logMessage", {user, type: "gun", content: `${user.username} just shot ${victim.username}`})
    io.to(id).emit("blowUp", { bulletId });
  })

  socket.on("endBullet", ({bulletId}) => {
    const users = getUsers();
    users.forEach((user) => {
      if (user.id != socket.id) {
        io.to(user.id).emit("endBullet", {bulletId});
      }
    });
  })
  socket.on("dead", () => {
    const user = getCurrentUser(socket.id);
    kill(user.id);
    io.emit("logMessage", { user, type: "skull", time: Date.now(), content: `${user.username} died!` })
    io.emit("users", { users: getUsers() });
  })
  socket.on("spiked", () => {
    const user = getCurrentUser(socket.id);
    io.emit("logMessage", { user, type: "Spike", time: Date.now(), content: `${user.username} has hit a spike and lost one health!` })
  })
  socket.on("countdown", () => {
    const users = getUsers();
    users.forEach((user) => {
      if (user.id != socket.id) {
        io.to(user.id).emit("countdown");
      }
    });
  });
  socket.on("explode", () => {
    io.emit("logMessage", { user, type: "skull", time: Date.now(), content: `${user.username} died!` })
    const users = getUsers();
    users.forEach((user) => {
      if (user.id != socket.id) {
        io.to(user.id).emit("explode");
      }
    });
  })

  socket.on("explodeKill", ({id}) => {
    // recieved total damage
    io.to(id).emit("explodeKill");
  })
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


