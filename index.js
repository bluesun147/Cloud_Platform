// consume the game.js(game engine)
// initialize play area
Game.init(320, 480, "#DDD"); // width, height, bg color
Game.addHero( { x: 100, y: 200, imgSrc: "hero.png"}); // add props for addHero

Game.addCloud(200, 210, 80, 10, "cyan"); // x, y, w, h, color
Game.addCloud(30, 380, 40, 10, "orange");
Game.addCloud(200, 340, 60, 10, "green");
Game.addCloud(100, 310, 60, 10, "red");
Game.addCloud(30, 140, 40, 10, "blue");
Game.addCloud(200, 70, 60, 10, "pink");
// ground cloud
Game.addCloud(0, Game.world.h() - 15, Game.world.w(), 15, "teal");

Game.enableParticles(100); // smoke particles

Game.start();