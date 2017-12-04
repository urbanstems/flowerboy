/* global Phaser */
/* eslint-disable no-param-reassign */

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
let flowerLeft;
let flowerRight;

function preload() {
  game.load.image('flower', 'assets/games/flowerboy/flower.png');
  game.load.spritesheet('house', 'assets/games/flowerboy/house140x140x2.png', 140, 140);
  game.load.image('car', 'assets/games/flowerboy/player.png');
  game.load.spritesheet('kaboom', 'assets/games/flowerboy/house-blue.png', 140, 140);
  game.load.image('road', 'assets/games/flowerboy/road.png');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  road = game.add.tileSprite(0, 0, 800, 600, 'road');

  flowers = game.add.group();
  flowers.enableBody = true;
  flowers.physicsBodyType = Phaser.Physics.ARCADE;
  flowers.createMultiple(30, 'flower');
  flowers.setAll('anchor.x', 0.5);
  flowers.setAll('anchor.y', 1);
  flowers.setAll('outOfBoundsKill', true);
  flowers.setAll('checkWorldBounds', true);

  // delete this
  deliveries = game.add.group();
  deliveries.enableBody = true;
  deliveries.physicsBodyType = Phaser.Physics.ARCADE;
  deliveries.setAll('anchor.x', 0.5);
  deliveries.setAll('anchor.y', 1);
  deliveries.setAll('outOfBoundsKill', true);
  deliveries.setAll('checkWorldBounds', true);

  houses = game.add.group();
  houses.enableBody = true;
  houses.physicsBodyType = Phaser.Physics.ARCADE;

  createHouses();

  player = game.add.sprite(400, 500, 'car');
  player.anchor.setTo(0.5, 0.5);
  game.physics.enable(player, Phaser.Physics.ARCADE);

  scoreString = 'Score : ';
  scoreText = game.add.text(10, 10, scoreString + score, { font: '20px Arial', fill: '#fff' });

  lives = game.add.group();
  game.add.text(game.world.width - 100, 10, 'Lives : 3 ', { font: '20px Arial', fill: '#fff' });

  stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', { font: '34px Arial', fill: '#fff' });
  stateText.anchor.setTo(0.5, 0.5);
  stateText.visible = false;

  deliveries = game.add.group();
  deliveries.createMultiple(30, 'kaboom');
  deliveries.forEach(setupHouse, this);

  cursors = game.input.keyboard.createCursorKeys();
  fireLeftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  fireRightKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
}

function createHouses() {
  const x = 1;
  const y = 1;
  const house = houses.create(x * 600, y * 0, 'house');
  house.body.moves = false;

  game.add.tween(houses).to(
    { y: 800 }, 6000,
    Phaser.Easing.Linear.None, true, 0, 30, false
  );
  console.log(`X: ${house.body.x}`);
  console.log(`Y: ${house.body.y}`);
}

function setupHouse(house) {
  house.anchor.x = 0.5;
  house.anchor.y = 0.5;
  house.animations.add('kaboom');
}

function update() {
  road.tilePosition.y += 2;

  if (player.alive) {
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

    if (fireLeftKey.isDown) {
      fireBouquet('left');
    } else if (fireRightKey.isDown) {
      fireBouquet('right');
    }

    game.physics.arcade.overlap(flowers, houses, collisionHandler, null, this);
  }
}

function render() {

}

function collisionHandler(house, flower) {
  let delivery;

  flower.kill();
  console.log(`BEFORE KILLED VALUES: + ${house.body.x} , ${house.body.y}`);
  house.kill();

  score += 20;
  scoreText.text = scoreString + score;

  delivery = deliveries.getFirstExists(false);

  house.body.x = 600;
  console.log(`X: ${house.body.x}`);
  console.log(`Y: ${house.body.y}`);
  delivery.reset(house.body.x, house.body.y);
  console.log(`reset X: ${house.body.x}`);
  console.log(`reset Y: ${house.body.y}`);
  delivery.play('kaboom', 10, false, false);

  if (houses.countLiving() === 0) {
    score += 1000;
    scoreText.text = scoreString + score;

    stateText.text = ' You Won, \n Click to restart';
    stateText.visible = true;

    game.input.onTap.addOnce(restart, this);
  }
}

function fireBouquet(position) {
  if (game.time.now > flowerTime) {
    flowerLeft = flowers.getFirstExists(false);
    if (flowerLeft && position === 'left') {
      flowerLeft.reset(player.x, player.y + 8);
      flowerLeft.body.velocity.x = -400;
      flowerTime = game.time.now + 200;
    }

    flowerRight = flowers.getFirstExists(false);
    if (flowerRight && position === 'right') {
      flowerRight.reset(player.x, player.y + 8);
      flowerRight.body.velocity.x = 400;
      flowerTime = game.time.now + 200;
    }
  }
}

function restart() {
  lives.callAll('revive');
  houses.removeAll();
  createHouses();

  player.revive();
  stateText.visible = false;
}
