const users = [];
var count = 0;

const gravity = 0.5;

function userJoin(id, username, skin) {
  const user = {
    id,
    username,
    skin,
    x: 50,
    y: 50,
    xvel: 0,
    yvel: 0,
    xacc: 0,
    yacc: gravity,
    dead: false
  };
  //console.log("JOIN")
  users.push(user);
  //console.log(users)
}

function getUsers() {
  return users;
}
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function userLeave(id) {
  // console.log("LEFT")
  // console.log(users)
  const index = users.findIndex((user) => user.id === id);
  return users.splice(index, 1)[0];
}
function setUser({ id, x, y, xvel, xacc, yvel, yacc }) {
  // console.log("setting user: ")
  // console.log({id, x, y, xvel, xacc, yvel, yacc})
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == id) {
      users[i].x = x;
      users[i].y = y;
      users[i].xvel = xvel;
      users[i].xacc = xacc;
      users[i].yvel = yvel;
      users[i].yacc = yacc;
    }
  }
}
function startCount() {
  //console.log("start count")
  count = 0;
}

function counted() {
  //console.log("counting")
  //console.log(count)
  count++;
  if (count == users.length - 1) {
    count = 0;
    return true;
  } else {
    return false;
  }
}
function kill(userId){
  const index = users.findIndex((user) => user.id === userId);
  users[index].dead = true;
}
module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getUsers,
  setUser,
  startCount,
  counted,
  kill
};
