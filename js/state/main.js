ScoreDisplay = function(game,x,y,color) {
	
	Phaser.Group.call(this,game);
	this.x = x;
	this.y = y;
	
	this.img = this.game.add.sprite(0,0,'sprites','tile_big.png');
	this.add(this.img);
	this.img.anchor.set(0.5);
	this.img.scale.set(0.5);
	this.img.tint = color;
	
	this.text = this.game.add.text(0,0,'0',this.textStyle);
	this.add(this.text);
	this.text.anchor.set(0.5);
	
	this.game.add.existing(this);
	
}
ScoreDisplay.prototype = Object.create(Phaser.Group.prototype);
ScoreDisplay.prototype.constructor = ScoreDisplay;
ScoreDisplay.prototype.textStyle = { font: "bold 72px Arial", fill: "#CDFFC9", boundsAlignH: "center", boundsAlignV: "middle", align: "center" };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var main = {
	
	init: function(gameParams) {
		//Get params from menu state
		this.boardSize = gameParams.boardSize;
		this.multiplayer = gameParams.multiplayer;
	},
	create: function() {
		
		this.turn = 'blue';
		this.victor = 'tie';
		
		this.gameOver = false;
		
		//Create game board
		this.board = new Board(this.game,this.boardSize);
		this.board.start();
		
		this.board.setTile(0,this.boardSize-1,'blue');
		this.board.setTile(this.boardSize-1,0,'orange');
		
		//Add function to get input from the player
		this.game.input.onDown.add(this.doPlayerTurn, this);
		
		//Score display
		var offset = (this.boardSize * 64 / 2) + 64;
		this.scoreBlue = new ScoreDisplay(this.game,this.world.centerX - offset,this.world.centerY - offset,colors.blue);
		this.scoreOrange = new ScoreDisplay(this.game,this.world.centerX + offset,this.world.centerY + offset,colors.orange);
		
		this.scoreBlue.text.text = "[0]";
		
		//Victory text
		this.victoryText = this.game.add.text(this.world.centerX,this.world.centerY - 256,'Tie!',ScoreDisplay.prototype.textStyle);
		this.victoryText.fill = "#7FC479";
		this.victoryText.scale.set(0);
		this.victoryText.anchor.set(0.5);
		
		TweenHelper.SpinExpand(this.scoreBlue,500,100);
		TweenHelper.SpinExpand(this.scoreOrange,500,100);

		
		//Start ai
		if (!this.multiplayer) {
			TilerAi.start(this.board);
		}
		
		console.log("Game started! Board size " + this.boardSize + (this.multiplayer ? ", no AI" : ", with AI"));
		
	},
	doPlayerTurn: function(e) {
		
		//Is it the player's turn?
		if (this.multiplayer || (!this.multiplayer && this.turn == 'blue')) {
		
			//Get player input
			var x = e.x - this.board.corner;
			var y = e.y - this.board.corner;
			if (x > 0 && x < this.board.corner2 && y > 0 && y < this.board.corner2) {
				
				x = Math.floor(x/64);
				y = Math.floor(y/64);
				
				if (this.board.validClaim(x,y,this.turn)) {
					this.board.setTile(x,y,this.turn);
					this.nextTurn();
				}else{
					var tile = this.board.getTile(x,y);
					TweenHelper.Wiggle(tile,500,0);
				}
				
			}
		
		}
		
	},
	doComputerTurn: function() {
		
		TilerAi.runAiStack();
		this.nextTurn();
		
	},
	nextTurn: function() {
		
		this.turn = (this.turn == 'blue' ? 'orange' : 'blue');
		
		this.board.clearLocks(this.turn);
		
		//Has anyone won?
		if (this.board.orangeCount + this.board.blueCount == this.board.count) {
			
			//Remove player input listener
			this.game.input.onDown.remove(this.doPlayerTurn, this);
			
			if (this.board.orangeCount > this.board.blueCount) {
				this.victor = 'orange';
			}else if (this.board.orangeCount < this.board.blueCount) {
				this.victor = 'blue';
			}
			
			this.game.time.events.add(500,this.endGame,this);
			
			return;//End game
			
		}
		
		//Display scores
		if (this.turn == 'blue') {
			TweenHelper.Flip(this.scoreOrange,500,0,this.updateScores,this);
		}else if (this.turn == 'orange') {
			TweenHelper.Flip(this.scoreBlue,500,0,this.updateScores,this);
		}
		
		
		if (!this.multiplayer) {
			if (this.turn == 'orange') {
				//If we're in singleplayer, and it's orange's turn, do the CPU turn
				//Add some randomness to the dekay, to make it feel more organic
				this.game.time.events.add((Math.random() * 100) + 700,this.doComputerTurn,this);
			}
		}
		
		
		
	},
	updateScores: function() {
		this.scoreBlue.text.text = (this.turn == 'blue' ? '[':'') + this.board.blueCount + (this.turn == 'blue' ? ']':'');
		this.scoreOrange.text.text = (this.turn == 'orange' ? '[':'') + this.board.orangeCount + (this.turn == 'orange' ? ']':'');
	},
	endGame: function() {
		
		this.updateScores();
		this.board.backBoard.visible = false;
		
		for (var i=0;i<this.board.tiles.length;i++) {
			TweenHelper.Fade(this.board.tiles[i],1500,i*50);
		}
		
		TweenHelper.Expand(this.victoryText,500,0);
		
		if (this.victor != 'tie') {
			
		//	this.victoryText.fill = (this.victor == 'blue') ? "#79B1C4" : "#E28060";
			this.victoryText.text = (this.victor == 'blue') ? 'Blue Wins!' : 'Orange Wins!';
			
			var tile = (this.victor == 'orange') ? this.scoreOrange : this.scoreBlue;
			var tile2 = (this.victor == 'orange') ? this.scoreBlue : this.scoreOrange;
			
			TweenHelper.Fade(tile2,3000,0);
			
			this.add.tween(tile).to({x:this.world.centerX,y:this.world.centerY},2500,Phaser.Easing.Elastic.Out,true);
			this.add.tween(tile.scale).to({x:2,y:2},2500,Phaser.Easing.Elastic.Out,true);
			this.add.tween(tile.text).to({alpha:0},250,Phaser.Easing.Linear.None,true);
			
		}else{
			TweenHelper.Fade(this.scoreOrange,3000,0);
			TweenHelper.Fade(this.scoreBlue,3000,0);
			
			this.add.tween(this.victoryText).to({y:this.world.centerY},500,Phaser.Easing.Linear.None,true);
		}
		
		this.gameOver = true;
		this.game.input.onDown.add(this.gotoMenu, this);
		
	},
	gotoMenu: function() {
		
		if (this.victor != 'tie') {
			TweenHelper.Fade(this.scoreBlue,500,0);
			TweenHelper.Fade(this.scoreOrange,500,0);
		}
		TweenHelper.Fade(this.victoryText,500,0);
		
		this.game.time.events.add(500,function() {this.game.state.start('Menu');},this);
		
	}

	
}