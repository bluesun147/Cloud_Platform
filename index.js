// consume the game.js(game engine)
Game.init(320, 480, "black"); // play area. width, height, bg color
Game.addHero(obj); // add props for addHero
Game.physics.setGravity(0.7);

Game.addCloud(100, 200, 80, 20, "orange"); // x, y, cloud width, cloud height, color

Game.start();