/* global Phaser */

const game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', {
  preload, create, update, render,
});

let player;
let houses;
let flowers;
let flowerTime = 0;
let cursors;
let fireLeftKey;
let fireRightKey;
let deliveries;
let road;
let score = 0;
let scoreString = '';
let scoreText;
let lives;
let stateText;
let deliveredBouquet;
let flowerLeft;
let flowerRight;

function preload() {
  game.load.image('flower', 'assets/games/flowerboy/flower.png');
  game.load.spritesheet('house', 'assets/games/flowerboy/house140x140.png', 140, 140);
  game.load.image('car', 'assets/games/flowerboy/player.png');
  game.load.spritesheet('kaboom', 'assets/games/flowerboy/explode.png');
  game.load.image('road', 'assets/games/flowerboy/road.png');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  // the scrolling road background
  road = game.add.tileSprite(0, 0, 800, 600, 'road');

  // the flower group
  flowers = game.add.group();
  flowers.enableBody = true;
  flowers.physicsBodyType = Phaser.Physics.ARCADE;
  flowers.createMultiple(30, 'flower');
  flowers.setAll('anchor.x', 0.5);
  flowers.setAll('anchor.y', 1);
  flowers.setAll('outOfBoundsKill', true);
  flowers.setAll('checkWorldBounds', true);

  // creates a group of houses which will serve as targets
  houses = game.add.group();
  houses.enableBody = true;
  houses.physicsBodyType = Phaser.Physics.ARCADE;

  createHouses();

  // the player
  player = game.add.sprite(400, 500, 'car');
  player.anchor.setTo(0.5, 0.5);
  game.physics.enable(player, Phaser.Physics.ARCADE);

  // the score
  scoreString = 'Score : ';
  scoreText = game.add.text(10, 10, scoreString + score, { font: '20px Arial', fill: '#fff' });

  // player lives
  lives = game.add.group();
  game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '20px Arial', fill: '#fff' });

  // text
  stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', { font: '34px Arial', fill: '#fff' });
  stateText.anchor.setTo(0.5, 0.5);
  stateText.visible = false;

  // the delivery pool
  deliveries = game.add.group();
  deliveries.createMultiple(30, 'kaboom');
  deliveries.forEach(setupHouse, this);

  // game controls
  cursors = game.input.keyboard.createCursorKeys();
  fireLeftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  fireRightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
}

function createHouses() {
  const house = houses.create(20, 0, 'house');
  house.body.moves = false;

  // start the moving the house group
  const tween = game.add.tween(houses).to(
    { y: 800 }, 6000,
    Phaser.Easing.Linear.None, true, 0, 10, false
  );
}

function setupHouse(house) {
  house.anchor.x = 0.5;
  house.anchor.y = 0.5;
  // house.animations.add('kaboom');
}

function update() {
  // scroll the road background
  road.tilePosition.y += 2;

  if (player.alive) {
    // reset the player, then check for movement keys
    player.body.velocity.setTo(0, 0);

    if (cursors.left.isDown) {
      player.body.velocity.x = -200;
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 200;
    } else if (cursors.up.isDown) {
      player.body.velocity.y = -90;
    } else if (cursors.down.isDown) {
      player.body.velocity.y = 90;
    }

    // firing bouquet
    if (fireLeftKey.isDown) {
      fireBouquet('left');
    } else if (fireRightKey.isDown) {
      fireBouquet('right');
    }

    // run collision
    game.physics.arcade.overlap(flowers, houses, collisionHandler, null, this);
    game.physics.arcade.overlap(player, null, this);
  }
}

function render() {
  // for (let i = 0; i < houses.length; i++) {
  //   game.debug.body(houses.children[i]);
  // }
}

function collisionHandler(house, flower) {
  flower.kill();
  house.kill();

  // increase the score
  score += 20;
  scoreText.text = scoreString + score;

  // and create a delivery ref. explosion
  const delivery = deliveries.getFirstExists(false);
  delivery.reset(house.body.x, house.body.y);
  delivery.play('kaboom', 30, false, true);

  if (houses.countLiving() === 0) {
    score += 1000;
    scoreText.text = scoreString + score;

    stateText.text = ' You Won, \n Click to restart';
    stateText.visible = true;

    // the "click to restart" handler
    game.input.onTap.addOnce(restart, this);
  }
}

const delivery = deliveredBouquet.getFirstExists(false);
delivery.reset(player.body.x, player.body.y);
delivery.play('kaboom', 30, false, true);

if (lives.countLiving() < 1) {
  player.kill();

  stateText.text = ' GAME OVER \n Click to restart';
  stateText.visible = true;

  // the 'click to restart' handler
  game.input.onTap.addOnce(restart, this);
}

function fireBouquet(position) {
  // set a time limit for the flowers to fire
  if (game.time.now > flowerTime) {
    // grab the first flower from the pool
    flowerLeft = flowers.getFirstExists(false);
    if (flowerLeft && position === 'left') {
      // and fire it left
      flowerLeft.reset(player.x, player.y + 8);
      flowerLeft.body.velocity.x = -400;
      flowerTime = game.time.now + 200;
    }

    // grab the first flower from the pool
    flowerRight = flowers.getFirstExists(false);
    if (flowerRight && position === 'right') {
      // and fire it right
      flowerRight.reset(player.x, player.y + 8);
      flowerRight.body.velocity.x = 400;
      flowerTime = game.time.now + 200;
    }
  }
}

function restart() {
  // a new level starts and resets the life count
  lives.callAll('revive');
  // and brings the houses back
  houses.removeAll();
  createHouses();

  // revives the player
  player.revive();
  // hides the text
  stateText.visible = false;
}
