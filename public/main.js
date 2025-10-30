function $id(id) {
  return document.getElementById(id);
}
function $(selector) {
  return document.querySelector(selector);
}

const socket = io();

const userForm = $id("user-form");

var skins = [
  "gogo",
  "mewmew",
  "lion",
  "georgeWashington",
  "Trump_dinosaur1",
  "JoeBiden4pygame",
  "tjeff",
  "benji",
];

var myUsername = "";
var myImage;
var platforms;
var coins;
var spikes;
var coinNum = 0;
var myBullets = [];
var bullets = [];
var deleted = false;
var chosenImage;
let pledge =
  "I pledge allegiance to the Flag of the United States of America, and to the Republic for which it stands, one nation under God, indivisible, with liberty and justice for all.";
pledge = pledge.toUpperCase();
const pledgeInput = document.getElementById("pledge");
const pledgeMessage = document.getElementById("pledge-message");
var audio = document.getElementById("audio");
const coinAudio = new Audio("goodcoin.wav");
const Gunshot = new Audio("gunshot.wav");
const punchAudio = document.getElementById("punch-audio");
//const coinAudio = document.getElementById("coin-audio");
let americaMode = false;
audio.loop = true; // Enable looping

// pledgeInput.addEventListener("paste", e => e.preventDefault());
userForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (pledgeInput.value.trim().toUpperCase() != pledge) {
    pledgeMessage.style.display = "block";
    setTimeout(() => {
      pledgeMessage.style.display = "none";
    }, 2000);
  } else {
    const usernameInput = $id("username-input");
    const username = usernameInput.value.trim();
    myUsername = username;
    userForm.style.display = "none";

    $id("skin-form").style.display = "block";
    const skinElement = $id("skins");
    skins.forEach((skin) => {
      let img = document.createElement("img");
      img.src = `skins/${skin}.png`;
      img.className = "skin";
      img.id = skin;

      // Append the image element to the skinElement
      skinElement.appendChild(img);
      img.onclick = function () {
        chosenImage = skin;
        socket.emit("joinRoom", { username, skin });
        myImage = new Image();
        myImage.src = `skins/${skin}.png`;
        $id("canvas").style.display = "block";
        $id("skin-form").style.display = "none";
        $id("main").style.display = "flex";
        console.log("AHHH WHATS RONG");
        socket.on("platforms", ({ myPlatform, myCoins, mySpikes }) => {
          console.log("hello");

          platforms = myPlatform;
          coins = myCoins;
          spikes = mySpikes;
          game();
        });
      };
    });
  }
});
function game() {
  if (americaMode) {
    // slideshow
    const slideshow = [
      "decOfInd.png",
      "decOfInd.webp",
      "franklin.webp",
      "george.webp",
      "jefferson.jpg",
      "rivercrossing.jpg",
      "signers.jpg",
      "valleyforge.jpg",
    ];
    const slideshowOverlay = document.getElementById("slideshow-overlay");
    let count = 0;
    let maxOp = 0.3;
    let opacity = maxOp;
    slideshowOverlay.style.backgroundImage = `url("slideshow/${slideshow[count]}")`;
    slideshowOverlay.style.opacity = opacity;
    setInterval(() => {
      let interval = setInterval(() => {
        opacity -= 0.01;
        slideshowOverlay.style.opacity = opacity;
        console.log(`opacity: ${opacity}`);
        if (opacity <= 0) {
          opacity = 0;
          console.log("OMG opacity is zero");
          clearInterval(interval);
          console.log("OMG i cleared the interval");
          count++;
          if (count == slideshow.length) count = 0;
          slideshowOverlay.style.backgroundImage = `url("slideshow/${slideshow[count]}")`;
          let appear = setInterval(() => {
            console.log("APPEAR");
            opacity += 0.01;
            slideshowOverlay.style.opacity = opacity;
            if (opacity >= maxOp) {
              opacity = maxOp;
              clearInterval(appear);
            }
          }, 1);
        }
      }, 1);
    }, 2000);
  }
  if (americaMode) $id("america-overlay").style.display = "block";
  if (americaMode) {
    audio.src = "starSpangled.mp3";
  } else {
    audio.src = "blacksmith.mp3";
  }
  audio.play();
  $id("loading").style.display = "none";
  let hasGun = false;
  let gunAmmo = 10;
  let dead = false;
  let freeze = false;
  let hearts = 5;
  let potions = 0;
  let revives = 0;
  let countdownNum = -1;
  let otherCounts = [];
  let explosionSize = -1;
  let otherExplosions = [];
  const SEND_TICK = 50; // ms
  setInterval(() => {
    if (!dead) {
      socket.emit("changeValue", {
        x: player.x,
        y: player.y,
        xvel: player.xVelocity,
        xacc: player.xacc,
        yvel: player.yVelocity,
        yacc: player.yacc,
      });
    }
  }, SEND_TICK);
  socket.emit("youCanGiveMeUsers");
  socket.on("users", ({ users }) => {
    otherPlayers = [];
    $id("user-list").innerHTML = "";
    for (const user of users) {
      $id("user-list").innerHTML +=
        `<li id="${user.id}" class="user">${user.username}</li>`;
      if (user.username != myUsername && !user.dead) {
        const newImage = new Image();
        newImage.src = `skins/${user.skin}.png`;
        user.skin = newImage;
        otherPlayers.push(user);
        //console.log(otherPlayers)
      } else {
        $id(user.id).classList.add("me-user");
      }
    }
  });

  // Game code

  const canvas = $id("canvas");
  const ctx = canvas.getContext("2d");

  const gravity = 0.5;
  var otherPlayers = [];

  let player = {
    x: 50,
    y: 50,
    skin: myImage,
    width: 25,
    height: 25,
    xacc: 0,
    yacc: gravity,
    xVelocity: 0,
    yVelocity: 0,
    onGround: false, // New property to track if the player is on the ground
  };
  console.log(chosenImage);
  if (
    chosenImage == "georgeWashington" ||
    chosenImage == "Trump_dinosaur1" ||
    chosenImage == "JoeBiden4pygame"
  ) {
    player.height = 39;
  } else if (chosenImage == "tjeff" || chosenImage == "benji") {
    player.height = 50;
  }
  const jumpStrength = 10; // Change this value to adjust jump height

  const speedCost = 20;
  const potionCost = 20;
  const reviveCost = 75;
  const gunCost = 20;
  const gunAmmoCost = 10;
  const bulletSpeed = 5;
  const bombCost = 200;

  function canBuy() {
    if (!dead) {
      if (coinNum >= speedCost) $id("speed").disabled = false;
      else $id("speed").disabled = true;

      if (coinNum >= potionCost) $id("buy-potion").disabled = false;
      else $id("buy-potion").disabled = true;
      if (coinNum >= reviveCost) $id("buy-revive").disabled = false;
      else $id("buy-revive").disabled = true;
      if (hasGun) {
        $id("buy-gun").disabled = true;
        $id("buy-gun").innerHTML = "Bought";
        if (coinNum >= gunAmmoCost) $id("buy-ammo").disabled = false;
        else $id("buy-ammo").disabled = true;
      } else {
        if (coinNum >= gunCost) $id("buy-gun").disabled = false;
        else $id("buy-gun").disabled = true;
        $id("buy-ammo").disabled = true;
      }
      if (coinNum >= bombCost) $id("buy-bomber").disabled = false;
      else $id("buy-bomber").disabled = true;
    } else {
      $id("speed").disabled = true;
      $id("buy-gun").disabled = true;
      $id("buy-potion").disabled = true;
      $id("buy-ammo").disabled = true;
      $id("buy-revive").disabled = true;
      $id("buy-bomber").disabled = true;
    }
  }

  function urDead(isCoin, coin) {
    //alert("you are dead")
    if (revives > 0) {
      socket.emit("revived");
      revives--;
      $id("revive-num").innerHTML = revives;
      $id("revive-overlay").style.display = "flex";
      freeze = true;
      setTimeout(() => {
        freeze = false;
        hearts = 5;
        $id("revive-overlay").style.display = "none";
        if (isCoin) {
          player.x = coin.x + 50;
          changeStuff();
        }
      }, 500);
    } else {
      dead = true;
      socket.emit("dead");
      $id("game-over-overlay").style.display = "flex";
      $id("dismiss-game-over").onclick = function () {
        $id("game-over-overlay").style.display = "none";
      };
    }
  }

  function countdown() {
    countdownNum = 3;
    setTimeout(() => {
      countdownNum -= 1;
      setTimeout(() => {
        countdownNum -= 1;
        setTimeout(() => {
          countdownNum = -1;
          freeze = true;
          explode();
          socket.emit("explode");
        });
      }, 1000);
    }, 1000);
  }
  function explode() {
    explosionSize = 0;
  }
  function findDist(x1, y1, x2, y2) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
  }
  function renderStuff() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    //ctx.fillStyle = 'blue';
    if (dead) ctx.globalAlpha = 0.5;

    if (player.xVelocity < 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(-1, 1);

      ctx.drawImage(player.skin, -player.width, 0, player.width, player.height);
      ctx.restore();
    } else {
      ctx.drawImage(
        player.skin,
        canvas.width / 2,
        canvas.height / 2,
        player.width,
        player.height,
      );
    }

    ctx.globalAlpha = 1;

    myBullets.forEach((bullet) => {
      ctx.fillStyle = "red";
      ctx.fillRect(
        bullet.x + canvas.width / 2 - player.x,
        bullet.y + canvas.height / 2 - player.y,
        10,
        10,
      );
      bullet.x += bullet.xvel;
      bullet.y += bullet.yvel;
      // console.log("bullet.x: " + bullet.x + " bullet.y: " + bullet.y)
      //   console.log("xvel: " + bullet.xvel + " yvel: " + bullet.yvel)
    });
    bullets.forEach((bullet) => {
      ctx.fillStyle = "red";
      ctx.fillRect(
        bullet.x + canvas.width / 2 - player.x,
        bullet.y + canvas.height / 2 - player.y,
        10,
        10,
      );
      bullet.x += bullet.xvel;
      bullet.y += bullet.yvel;
    });

    otherPlayers.forEach((otherPlayer) => {
      // console.log(otherPlayer)
      ctx.save();
      if (otherPlayer.xVelocity < 0) {
        ctx.scale(-1, 1);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.drawImage(
          otherPlayer.skin,
          otherPlayer.x - player.x - player.width,
          otherPlayer.y - player.y,
          player.width,
          player.height,
        );
      } else {
        ctx.drawImage(
          otherPlayer.skin,
          otherPlayer.x + canvas.width / 2 - player.x,
          otherPlayer.y + canvas.height / 2 - player.y,
          player.width,
          player.height,
        );
      }

      ctx.restore();
      for (let i = 0; i < myBullets.length; i++) {
        let bullet = myBullets[i];
        if (
          bullet.x <= otherPlayer.x + player.width &&
          bullet.x + 10 >= otherPlayer.x &&
          bullet.y <= otherPlayer.y + player.height &&
          bullet.y + 10 >= otherPlayer.y
        ) {
          socket.emit("blowUp", { id: otherPlayer.id, bulletId: bullet.id });
          myBullets.splice(i, 1);
        }
      }
    });
    // draw countdown
    if (countdownNum != -1) {
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText(
        countdownNum,
        canvas.width / 2,
        canvas.height / 2 - player.height - 30,
      );
    }
    // Draw platforms
    platforms.forEach((platform) => {
      ctx.fillStyle = platform.color;
      ctx.fillRect(
        platform.x + canvas.width / 2 - player.x,
        platform.y + canvas.height / 2 - player.y,
        platform.width,
        platform.height,
      );
      for (let i = 0; i < myBullets.length; i++) {
        let bullet = myBullets[i];
        if (
          bullet.x <= platform.x + platform.width &&
          bullet.x + 10 >= platform.x &&
          bullet.y <= platform.y + platform.height &&
          bullet.y + 10 >= platform.y
        ) {
          socket.emit("endBullet", { bulletId: bullet.id });
          myBullets.splice(i, 1);
        }
      }
    });

    // Draw coins
    let myGif = new Image();
    if (americaMode) {
      myGif.src = "america_emoji.png";
    } else {
      myGif.src = "coin.gif";
    }

    coins.forEach((coin) => {
      if (
        coin.x + canvas.width / 2 - player.x > -10 &&
        coin.x + canvas.width / 2 - player.x < canvas.width + 10 &&
        coin.y + canvas.height / 2 - player.y > -10 &&
        coin.y + canvas.height / 2 - player.y < canvas.height + 10
      ) {
        ctx.drawImage(
          myGif,
          coin.x + canvas.width / 2 - player.x,
          coin.y + canvas.height / 2 - player.y,
          20,
          20,
        );
      }
    });

    // spikes
    var spikeImg = new Image();
    spikeImg.src = "Spike.png";
    spikes.forEach((coin) => {
      if (
        coin.x + canvas.width / 2 - player.x > -10 &&
        coin.x + canvas.width / 2 - player.x < canvas.width + 10 &&
        coin.y + canvas.height / 2 - player.y > -10 &&
        coin.y + canvas.height / 2 - player.y < canvas.height + 10
      ) {
        ctx.drawImage(
          spikeImg,
          coin.x + canvas.width / 2 - player.x,
          coin.y + canvas.height / 2 - player.y,
          20,
          20,
        );
      }
    });
    // explosion
    if (explosionSize != -1) {
      explosionSize++;
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        explosionSize,
        0,
        2 * Math.PI,
      );
      ctx.fillStyle = "red";
      ctx.fill();
      otherPlayers.forEach((otherPlayer) => {
        if (
          findDist(otherPlayer.x, otherPlayer.y, player.x, player.y) <=
            explosionSize ||
          findDist(
            otherPlayer.x + player.width,
            otherPlayer.y,
            player.x,
            player.y,
          ) <= explosionSize ||
          findDist(
            otherPlayer.x,
            otherPlayer.y + player.height,
            player.x,
            player.y,
          ) <= explosionSize ||
          findDist(
            otherPlayer.x + player.width,
            otherPlayer.y + player.height,
            player.x,
            player.y,
          ) <= explosionSize
        ) {
          socket.emit("explodeKill", { id: otherPlayer.id });
        }
      });

      if (explosionSize == 100) {
        explosionSize = -1;
      }
    }

    // draw hearts
    for (let i = 0; i < hearts; i++) {
      let hrtImg = new Image();
      hrtImg.src = "heart.png";
      ctx.drawImage(hrtImg, i * 20, 0, 20, 20);
    }
    // draw x and y locations
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("x: " + Math.round(player.x), 0, 40);
    ctx.fillText("y: " + Math.round(player.y), 0, 60);
    let coinImage = new Image();
    if (americaMode) coinImage.src = "america_emoji.png";
    else coinImage.src = "coin.gif";
    ctx.drawImage(coinImage, canvas.width - 20, 0, 20, 20);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(coinNum, canvas.width - 40, 20);
  }

  socket.on("getInfo", () => {
    socket.emit("theInfo", {
      x: player.x,
      y: player.y,
      xvel: player.xVelocity,
      xacc: player.xacc,
      yvel: player.yVelocity,
      yacc: player.yacc,
    });
  });

// smoother updates: store target state and interpolate each frame
socket.on("changeIt", ({ id, x, y, xvel, xacc, yvel, yacc }) => {
  for (let i = 0; i < otherPlayers.length; i++) {
    if (otherPlayers[i].id == id) {
      // set a target and timestamp; do not teleport immediately
      otherPlayers[i].targetX = x;
      otherPlayers[i].targetY = y;
      otherPlayers[i].targetXVel = xvel;
      otherPlayers[i].targetYVel = yvel;
      otherPlayers[i].lastUpdate = Date.now();
      return;
    }
  }
  // If this player is new (maybe joined after list), add them:
  // (server sends full users periodically so this may rarely be needed)
  // create a minimal otherPlayer entry
  otherPlayers.push({
    id,
    x,
    y,
    xvel,
    yvel,
    targetX: x,
    targetY: y,
    targetXVel: xvel,
    targetYVel: yvel,
    lastUpdate: Date.now(),
    skin: new Image(), // will be replaced by full user list on next 'users' event
  });
});

  socket.on("deleteCoin", ({ coin }) => {
    coins.splice(coin, 1);
  });
  function changeStuff() {
    if (!dead) {
      socket.emit("changeValue", {
        x: player.x,
        y: player.y,
        xvel: player.xVelocity,
        xacc: player.xacc,
        yvel: player.yVelocity,
        yacc: player.yacc,
      });
    }
  }
  function gameLoop() {
    requestAnimationFrame(gameLoop);

    // change other players
    //console.log(otherPlayers)
// Smooth-interpolate remote players toward their target position
for (let i = 0; i < otherPlayers.length; i++) {
  const p = otherPlayers[i];
  if (p.targetX !== undefined) {
    // lerp factor: lower = smoother/slower, higher = snappier
    const LERP = 0.18;
    p.x += (p.targetX - p.x) * LERP;
    p.y += (p.targetY - p.y) * LERP;
    // optionally lerp velocity too (if you use it for facing)
    p.xvel = p.targetXVel ?? p.xvel;
    p.yvel = p.targetYVel ?? p.yvel;
  } else {
    // fallback physics if no target (rare)
    p.x += p.xvel || 0;
    p.y += p.yvel || 0;
  }
}

    // Apply gravity

    if (!player.onGround) player.yVelocity += gravity;
    // Move player
    player.x += player.xVelocity;
    player.y += player.yVelocity;

    // Assume player is not on the ground
    //player.onGround = false;

    // coins
    if (!dead) {
      for (let i = 0; i < coins.length; i++) {
        let coin = coins[i];
        if (
          (player.x < coin.x + 20 &&
            player.x + player.width > coin.x &&
            player.y < coin.y + 20 &&
            player.y + player.height > coin.y) ||
          (player.x + 20 < coin.x + 20 &&
            player.x + 20 > coin.x &&
            player.y < coin.y + 20 &&
            player.y + player.height > coin.y)
        ) {
          coinAudio.play().catch((error) => {
            console.error("Error playing audio:", error);
          });

          socket.emit("coinAte", { coin: i });
          coinNum++;
          canBuy();
          coins.splice(i, 1);
          break;
        }
      }
    }

    // spikes
    if (!freeze && !dead) {
      for (let i = 0; i < spikes.length; i++) {
        let coin = spikes[i];
        if (
          (player.x < coin.x + 20 &&
            player.x + player.width > coin.x &&
            player.y < coin.y + 20 &&
            player.y + player.height > coin.y) ||
          (player.x + 20 < coin.x + 20 &&
            player.x + 20 > coin.x &&
            player.y < coin.y + 20 &&
            player.y + player.height > coin.y)
        ) {
          punchAudio.play();
          socket.emit("spiked");
          $id("oof-overlay").style.display = "flex";
          freeze = true;
          setTimeout(() => {
            freeze = false;
            hearts--;
            if (hearts == 0) urDead(true, coin);
            $id("oof-overlay").style.display = "none";
            player.x = coin.x + 50;
            changeStuff();
          }, 500);

          //socket.emit("coinAte", ({coin: i}))
          //coinNum++;
          //canBuy();
          //coins.splice(i, 1)
          break;
        }
      }
    }

    // Collision detection
    let before = player.onGround;
    let after = false;
    let hitRoof = false;
    platforms.forEach((platform) => {
      //console.log(player.yVelocity)
      if (
        player.yVelocity <= 0 &&
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y <= platform.y + platform.height &&
        player.y + player.height > platform.y + platform.height
      ) {
        // Colliding with the platform from below
        console.log("OOOF");
        hitRoof = true;
        player.y = platform.y + player.height;
        player.yVelocity = 0;
        player.onGround = false;
        player.yacc = gravity;
        changeStuff();
      } else if (
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y <= platform.y + platform.height &&
        player.y + player.height >= platform.y
      ) {
        if (player.yVelocity < 0) {
          console.log("yveloct: " + player.yVelocity);
          console.log("player.y: " + player.y);
          console.log("value2: " + (platform.y + platform.height));
          console.log(
            "player.y + player.height: " + (platform.y + platform.height),
          );
        }

        // Colliding with the platform
        player.yVelocity = 0;
        player.y = platform.y - player.height; // Adjust player position
        //player.onGround = true; // Player is on the ground
        player.yacc = 0;
        //changeYAcc();
        after = true;
      }
    });
    if (!hitRoof && before != after) {
      player.onGround = after;
      if (after == false) player.yacc = gravity;
      else {
        player.yVelocity = 0;
        changeStuff();
      }
      changeStuff();
    }

    renderStuff();
  }

  var xSpeed = 5;
  function keyDownHandler(e) {
    if (!freeze) {
      if (e.key === "Right" || e.key === "ArrowRight") {
        player.xVelocity = xSpeed;
        changeStuff();
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        player.xVelocity = -xSpeed;
        changeStuff();
      } else if (
        (e.key === "Up" || e.key === "ArrowUp" || e.key === " ") &&
        player.onGround
      ) {
        player.yVelocity = -jumpStrength; // Apply an upward force
        player.onGround = false; // Player leaves the ground
        player.yacc = gravity; // Apply gravity
        changeStuff();
        changeStuff();
      }
    }
  }

  function keyUpHandler(e) {
    if (
      e.key === "Right" ||
      e.key === "ArrowRight" ||
      e.key === "Left" ||
      e.key === "ArrowLeft"
    ) {
      player.xVelocity = 0;
      changeStuff();
    }
  }

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  // chat stuff

  $id("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    let message = $id("message-input").value.trim();
    if (message !== "") {
      if (americaMode) message += "🇺🇸🇺🇸🇺🇸";
      socket.emit("chatMessage", { message });
      $id("message-input").value = "";
    }
  });
  socket.on("chatMessage", ({ user, message, time }) => {
    $id("messages").innerHTML += `  
  <div class="msg">
  <span class="msg-user">${user.username}</span>
  <span class="msg-time">${new Date(time).toLocaleTimeString()}</span>
        <p class="msg-text">${message}</p>
        </div>`;
  });
  $id("store-button").onclick = function () {
    $id("store").style.display = "block";
  };

  $id("store-x").onclick = function () {
    $id("store").style.display = "none";
  };
  $id("speed").onclick = function () {
    console.log("speed clickkkk");
    coinNum -= speedCost;
    xSpeed += 0.5;
    canBuy();
  };
  $id("buy-potion").onclick = function () {
    console.log("hellooooo");
    coinNum -= potionCost;
    potions++;
    $id("potion-num").innerHTML = potions;
    canBuy();
  };
  $id("potion-button").onclick = function () {
    if (potions > 0) {
      potions--;
      $id("potion-num").innerHTML = potions;
      hearts++;
    }
  };
  $id("buy-revive").onclick = function () {
    coinNum -= reviveCost;
    revives++;
    $id("revive-num").innerHTML = revives;
    canBuy();
  };

  $id("buy-gun").onclick = function () {
    $id("bullet-num").innerHTML = gunAmmo;
    coinNum -= gunCost;
    hasGun = true;
    socket.emit("buyGun");
    canBuy();
  };
// SHOOT: listen on canvas for correct pointer coords and use normalize with higher bullet speed
canvas.addEventListener("click", (ev) => {
  if (hasGun && gunAmmo > 0 && !dead && !freeze) {
    Gunshot.play();
    gunAmmo--;
    $id("bullet-num").innerHTML = gunAmmo;

    const rect = canvas.getBoundingClientRect();
    const clickX = ev.clientX - rect.left; // x inside canvas (0..canvas.width)
    const clickY = ev.clientY - rect.top; // y inside canvas (0..canvas.height)

    // convert canvas pixel to world coordinates
    const worldX = player.x - canvas.width / 2 + clickX;
    const worldY = player.y - canvas.height / 2 + clickY;

    const dx = worldX - (player.x + player.width / 2);
    const dy = worldY - (player.y + player.height / 2);
    const dist = Math.hypot(dx, dy) || 1;

    const BULLET_SPEED = 15; // faster and more consistent
    const vx = (dx / dist) * BULLET_SPEED;
    const vy = (dy / dist) * BULLET_SPEED;

    const playo = {
      x: player.x + player.width / 2, // start from player's center
      y: player.y + player.height / 2,
      xvel: vx,
      yvel: vy,
      id: socket.id + "-" + Date.now(),
    };

    // broadcast and locally add the bullet
    socket.emit("shoot", { bullet: playo });
    myBullets.push(playo);
  }
});

  socket.on("bullet", ({ bullet }) => {
    bullets.push(bullet);
  });
  // hit by bullet
  socket.on("blowUp", ({ bulletId }) => {
    bullets.splice(
      bullets.findIndex((bullet) => bullet.id == bulletId),
      1,
    );
    $id("oof-overlay").style.display = "flex";
    setTimeout(() => {
      hearts--;
      if (hearts == 0) urDead(false, -1);
      $id("oof-overlay").style.display = "none";
    }, 500);
  });
  // blown up
  socket.on("explodeKill", () => {
    urDead(false, -1);
  });
  socket.on("endBullet", ({ bulletId }) => {
    bullets.splice(
      bullets.findIndex((bullet) => bullet.id == bulletId),
      1,
    );
  });

  $id("buy-ammo").onclick = function () {
    if (hasGun) {
      gunAmmo += 10;
      $id("bullet-num").innerHTML = gunAmmo;
      coinNum -= 10;
      canBuy();
    }
  };
  socket.on("countdown");
  $id("buy-bomber").onclick = function () {
    socket.emit("countdown");
    canBuy();
    countdown();
  };
  socket.on("logMessage", ({ user, type, content }) => {
    $id("message-log").innerHTML += `
  <div class="log-message">
    <span class="log-message-title"> 
    <div class="log-imgs"><img class="log-img" width="20px" height = "20px" src="skins/${user.skin}.png"/> <img class="log-img" width="20px" height = "20px" src="${type}.png"/></div><span class="log-user">${user.username}</span> 
    
    <span class="log-message-time">${moment().format("h:mm:ss a")}</span></span>
    <p class="log-message-content">
      ${content} ${americaMode ? "🇺🇸" : ""}
    </p>
  </div>
  
  `;
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.pitch = 2;
      speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support the Web Speech API.");
    }

    $id("message-log").scrollTop = $id("message-log").scrollHeight;
  });

  gameLoop();
}
