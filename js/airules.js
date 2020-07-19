//Define all artificial intelligence rules
var TilerAi = {
	
	start: function(board) {
		this.board = board;
		this.color = 'orange';
	},
	
	runAiStack: function() {
		//Go through all of the functions in the ai, until you come up with something
		if (!this.checkWin()) {
			//Currently, this just chooses randomly, but it works pretty aight
			this.checkRandom();
		}
		
	},
	
	checkWin: function() {
		//Check if there is a tile that would win the game for either side
		this.board.updateCount();
		
		if (this.board.orangeCount + this.board.blueCount == this.board.count - 1) {
			
			//Will taking this win the game?
			if (this.board.orangeCount >= this.board.blueCount) {
				//Take it
				for (var i=0;i<this.board.count;i++) {
					if (this.board.tiles[i].color == 'blank') {
						//We found it
						this.board.setTileIndex(i,this.color);
						return true;
					}
				}
			}
			
		}else{
			//We did not find a tile that met the criteria
			return false;
		}
		
		
	},
	
	checkRandom: function() {
		
		//Just take the first available tile
		var tiles = this.board.validClaims(this.color);
		this.board.setTileIndex(tiles[Math.floor(Math.random() * tiles.length)],this.color);
		return true;
		
	}
	
};