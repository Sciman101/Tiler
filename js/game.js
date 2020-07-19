//Create game
var game = new Phaser.Game(800,800,Phaser.AUTO,'');

//Global vars
//Colors
var colors = {
	orange: 0xE28060,
	blue: 0x79B1C4,
	green: 0x7FC479,
	background: 0xCDFFC9,
};

var TweenHelper = {
	Expand : function(sprite,time,delay) {
		sprite.scale.set(1);
		return game.add.tween(sprite.scale).from({x:0,y:0},time,Phaser.Easing.Back.Out,true,delay);
	},
	Flip : function(sprite,time,delay,func,ctx) {
		sprite.scale.set(1);
		var t = time/2;
		var tween1 = game.add.tween(sprite.scale).to({x:1.3,y:0.1},t,Phaser.Easing.Circular.In,true,delay);
		var tween2 = game.add.tween(sprite.scale).to({x:1,y:1},t,Phaser.Easing.Circular.Out,false);
		tween1.chain(tween2);
		if (func && ctx) {
			tween1.onComplete.add(func,ctx);
		}
		return [tween2,tween2];
	},
	SpinExpand : function(sprite,time,delay) {
		if (sprite.scale.x <= 0) sprite.scale.set(1);
		sprite.angle = 0;
		var tween1 = game.add.tween(sprite).from({angle:180},time,Phaser.Easing.Elastic.Out,true,delay);
		var tween2 = game.add.tween(sprite.scale).from({x:0,y:0},time,Phaser.Easing.Back.Out,true,delay);
		return [tween1,tween2];
	},
	Fade : function(sprite,time,delay) {
		var tween1 = game.add.tween(sprite).to({alpha:0},time/3,Phaser.Easing.Linear.None,true,delay);
		var tween2 = game.add.tween(sprite.scale).to({x:0,y:0},time,Phaser.Easing.Linear.None,true,delay);
		return [tween1,tween2];
	},
	Jiggle : function(sprite,time,delay) {
		sprite.scale.set(1);
		return game.add.tween(sprite.scale).from({x:1.2,y:0.8},time,Phaser.Easing.Back.Out,true,delay);
	},
	Wiggle : function(sprite,time,delay) {
		sprite.angle = 0;
		var t = time/3;
		var tween1 = game.add.tween(sprite).to({angle:10},t,Phaser.Easing.Back.In,true,delay);
		var tween2 = game.add.tween(sprite).to({angle:-10},t,Phaser.Easing.Back.In,false);
		var tween3 = game.add.tween(sprite).to({angle:0},t,Phaser.Easing.Back.In,false);
		tween1.chain(tween2);
		tween2.chain(tween3);
		return [tween2,tween2,tween3];
	}
	
};

//Load in game states
game.state.add('Boot',boot);
game.state.add('Preload',preload);
game.state.add('Menu',menu);
game.state.add('Main',main);

game.state.start('Boot');