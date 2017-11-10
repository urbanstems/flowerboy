
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
  game.load.image('flower', 'assets/games/flowerboy/flower.png');
  game.load.image('potHole', 'assets/games/flowerboy/pothole.png');
  game.load.spritesheet('house', 'assets/games/flowerboy/house32x32x4.png', 32, 32);
  game.load.image('car', 'assets/games/flowerboy/player.png');
  game.load.spritesheet('kaboom', 'assets/games/flowerboy/explode.png');
  game.load.image('road', 'assets/games/flowerboy/road.png');
  game.load.image('background', 'assets/games/starstruck/background2.png');
}

var player;
var houses; // ref. aliens
var flowers; // ref. bullets = flowers
var flowerTime = 0;
var cursors;
var fireLeft;
var fireRight;
var delivered; // ref. explosions = delivered
var road;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var potHole; // ref. enemyBullet
var firingTimer = 0;
var stateText;
var housesWaiting = []; // ref. livingEnemies

function create(){

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

  potHoles = game.add.group();
  potHoles.enableBody = true;
  potHoles.physicsBodyType = Phaser.Physics.ARCADE;
  potHoles.createMultiple(30, 'potHole');
  potHoles.setAll('anchor.x', 0.5);
  potHoles.setAll('anchor.y', 1);
  potHoles.setAll('outOfBoundsKill', true);
  potHoles.setAll('checkWorldBounds', true);

  player = game.add.sprite(400, 500, 'car');
  player.anchor.setTo(0.5, 0.5);
  game.physics.enable(player, Phaser.Physics.ARCADE);

  // The targets
  houses = game.add.group();
  houses.enableBody = true;
  houses.physicsBodyType = Phaser.Physics.ARCADE;

  createHouses();

  scoreString = 'Score : ';
  scoreText = game.add.text(10, 10, scoreString + score, { font: '14px Arial', fill: '#fff' });

  lives = game.add.group();
  game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '14px Arial', fill: '#fff' });

  stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
  stateText.anchor.setTo(0.5, 0.5);
  stateText.visible = false;

  for (var i = 0; i < 3; i++)
  {
      var car = lives.create(game.world.width - 100 + (30 * i), 100, 'car');
      car.anchor.setTo(0.4, 0.4);
      car.angle = 90;
      car.alpha = 0.4;
  }

  delivered = game.add.group();
  delivered.createMultiple(30, 'kaboom');
  delivered.forEach(setupHouse, this);

  cursors = game.input.keyboard.createCursorKeys();
  fireLeftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  fireRightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

}

function createHouses() {

  for (var y = 0; y < 4; y++) {
    for (var x = 0; x < 10; x++) {
      var house = houses.create(x * 48, y * 50, 'house');
      house.anchor.setTo(0.5, 0.5);
      // house.animation.add('fly', [ 0, 1, 2, 3 ], 20, true);
      house.play('fly');
      house.body.moves = false;
    }
  }

  houses.x = 100;
  houses.y = 50;

  var tween = game.add.tween(houses).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

  tween.onLoop.add(descend, this);
}

function setupHouse (house) {

  house.anchor.x = 0.5;
  house.anchor.y = 0.5;
  // house.animations.add('kaboom');

}

function descend() {
  houses.y += 10;

}

function update() {

  road.tilePosition.y += 2;

  if (player.alive) {

      player.body.velocity.setTo(0, 0);

      if (cursors.left.isDown) {
        player.body.velocity.x = -200;
      } else if (cursors.right.isDown) {
        player.body.velocity.x = 200;
      }

      if (fireLeftKey.isDown) {
        fireBoutique('left');
      } else if (fireRightKey.isDown) {
        fireBoutique('right');
      }

      // if (game.time.now > firingTimer) {
      //   potHoleAppear(); // ref. enemyFires() this could even be a cat/dog
      // }

      game.physics.arcade.overlap(flowers, houses, collisionHandler, null, this);
      game.physics.arcade.overlap(potHoles, player, enemyHitsPlayer, null, this);
  }

}

function render() {

  // for (var i = 0; i < aliens.length; i++)
  // {
  //     game.debug.body(aliens.children[i]);
  // }

}

function collisionHandler (house, flower) {

  flower.kill();
  house.kill();

  //  Increase the score
  score += 20;
  scoreText.text = scoreString + score;

  var delivered = deliveredBoutique.getFirstExists(false);
  delivered.reset(house.body.x, house.body.y);
  delivered.play('kaboom', 30, false, true);

  if (houses.countLiving() == 0) {
    score += 1000;
    scoreText.text = scoreString + score;

    potHoles.callAll('kill', this);
    stateText.text = " You Won, \n Click to restart";
    stateText.visible = true;

    //the "click to restart" handler
    game.input.onTap.addOnce(restart,this);
  }

}

function enemyHitsPlayer (player,flower) {

  flower.kill();

  live = lives.getFirstAlive();

  if (live) {
      live.kill();
  }

  var delivered = deliveredBoutique.getFirstExists(false);
  delivered.reset(player.body.x, player.body.y);
  delivered.play('kaboom', 30, false, true);

  if (lives.countLiving() < 1) {
    player.kill();
    potHole.callAll('kill');

    stateText.text=" GAME OVER \n Click to restart";
    stateText.visible = true;

    game.input.onTap.addOnce(restart,this);
  }

}

function potHoleAppear() {

  potHole = potHoles.getFirstExists(false);

  newPotHoles.length=0;

  houses.forEachOrder(function(house) {

    newPotHoles.push(house);
  });

  if (potHole && newPotHoles.length > 0) {

    var random=game.rnd.integerInRange(0, newPotHoles.length-1);

    var shooter = newPotHoles[random];
    potHole.reset(shooter.body.x, shooter.body.y);

    game.physics.arcade.moveToObject(potHole, player, 120);
    firingTimer = game.time.now + 2000;
  }

}

function fireBoutique (position) {

  if (game.time.now > flowerTime){

      flowerLeft = flowers.getFirstExists(false);
        if (flowerLeft && position === 'left'){
          flowerLeft.reset(player.x, player.y + 8);
          flowerLeft.body.velocity.x = -400;
          flowerTime = game.time.now + 200;
      }

      flowerRight = flowers.getFirstExists(false);
        if(flowerRight && position === 'right'){

          flowerRight.reset(player.x, player.y + 8);
          flowerRight.body.velocity.x = 400;
          flowerTime = game.time.now + 200;
      }
  }

}

function resetBoutiques (flower) {

  flower.kill();
}

function restart() {

  lives.callAll('revive');
  houses.removeAll();
  createHouses();

  player.revive();
  stateText.visible = false;

}
