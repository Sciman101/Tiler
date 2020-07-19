BoardTile = function(game,x,y,color) {
	
	Phaser.Sprite.call(this,game,x,y,'sprites','tile.png');
	
	this.anchor.set(0.5);
	
	this.color = 'blank';
	this.setTint();
	
	this.indicator = this.game.add.sprite(-22,-22,'sprites','indicator.png');
	this.addChild(this.indicator);
	this.indicator.scale.set(0);
	
	this.locked = false;
	
	this.game.add.existing(this);
	
}
BoardTile.prototype = Object.create(Phaser.Sprite.prototype);
BoardTile.prototype.constructor = BoardTile;

BoardTile.prototype.setColor = function(color) {
	if (!this.locked) {
		if (this.color != color) {
			if (this.color == 'blank') {
				TweenHelper.Expand(this,350,0);
				this.color = color;
				this.setTint();
			}else{
				this.color = color;
				TweenHelper.Flip(this,350,0,this.setTint,this);
			}
		}
	}
}
BoardTile.prototype.setTint = function() {
	switch (this.color) {
			case 'blue': this.tint = colors.blue; break;
			case 'orange': this.tint = colors.orange; break;
			case 'blank': this.tint = colors.green; break;
		}
}
BoardTile.prototype.setLock = function(lock) {
	if (lock) {
		this.locked = true;
		this.indicator.alpha = 1;
		TweenHelper.Expand(this.indicator,500,0);
	}else{
		this.locked = false;
		TweenHelper.Fade(this.indicator,500,0);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Board = function(game,size) {
	
	this.game = game;
	this.size = size;
	
	this.corner = null;
	this.corner2 = null;
	this.tiles = [];
	
	this.backBoard = null;
	
	this.orangeCount = 0;
	this.blueCount = 0;
	this.count = Math.pow(this.size,2);
	
}
Board.prototype.start = function() {
	//Calculate corner position
	this.corner = this.game.world.centerX - (64 * this.size) / 2;
	this.corner2 = this.game.world.centerX + (64 * this.size) / 2;
	
	//Create back board
	this.backBoard = this.game.add.tileSprite(this.corner,this.corner,this.corner2-this.corner,this.corner2-this.corner,'sprites','tile.png');
	this.backBoard.tint = colors.green;
	this.backBoard.visible = false;
	
	//Create tiles
	for (var i=0;i<this.size;i++) {
		for (var j=0;j<this.size;j++) {
			
			var t = new BoardTile(this.game,this.corner + j*64 + 32,32,'blank');
			t.alpha = 0;
			
			//Tween
			this.game.add.tween(t).to({y:this.corner + i*64 + 32,alpha:1},500,Phaser.Easing.Circular.In,true,i*150+j*200);
			
			this.tiles.push(t);
		}
	}
	
	//Make background visible
	this.game.time.events.add(this.size*350,function() {this.backBoard.visible = true},this);
}
//Base functions
Board.prototype.getTile = function(x,y) {
	if (x >= this.size || x < 0 || y >= this.size || y < 0) return null;
	return this.tiles[x + y*this.size];
}

Board.prototype.updateCount = function() {
	
	this.blueCount = 0;
	this.orangeCount = 0;
	
	for (var i=0;i<this.count;i++) {
		if (this.tiles[i].color == 'blue') this.blueCount++;
		if (this.tiles[i].color == 'orange') this.orangeCount++;
	}
	
	//console.log('Tile count updated: Blue: ' + this.blueCount + ', Orange: ' + this.orangeCount);
}

Board.prototype.adjacentTo = function(x,y,color) {
	var tile = this.getTile(x,y);
	
	for (var i=-1;i<2;i++) {
		for (var j=-1;j<2;j++) {
			if (i != 0 || j != 0) {
				//If it isn't this tile
				var tile = this.getTile(x+i,y+j);
				if (tile) {
					if (tile.color == color) return true;
				}
			}
		}
	}	
	return false;
}

Board.prototype.validClaim = function(x,y,color) {
	//Can player <color> take tile at position <x,y>?
	var adjacent = this.adjacentTo(x,y,color);
	var tile = this.getTile(x,y);
	return (adjacent && !tile.locked && (tile.color != color));
	
}

Board.prototype.validClaimIndex = function(i,c) {
	//Can player <color> take tile at position <x,y>?
	return this.validClaim(i%this.size,Math.floor(i/this.size),c);
	
}

Board.prototype.validClaims = function(color) {
	
	var tiles = [];
	for (var i=0;i<this.count;i++) {
		if (this.validClaimIndex(i,color)) {
			tiles.push(i);
		}
	}
	return tiles;
	
}

Board.prototype.setTileIndex = function(i,c) {
	this.setTile(i%this.size,Math.floor(i/this.size),c);
}

Board.prototype.setTile = function(x,y,c) {
	
	//Flip a tile somewhere on the board
	var tile = this.getTile(x,y);
	
	//Is the tile blank?
	if (tile.color != 'blank') {
		//Set adjacent tiles
		for (var i=-1;i<2;i++) {
			for (var j=-1;j<2;j++) {
				//Get the tile at that location
				var t = this.getTile(x+i,y+j);
				if (t) {
					if (t.color == 'blank') {
						//Tile already blank, give it to us
						t.setColor(c);
					}else{
						//Invert the tile color
						if (t.color == 'blue') {t.setColor('orange')} else if (t.color == 'orange') {t.setColor('blue')};
					}
					//Lock the middle tile
					if (i == 0 && j == 0) t.setLock(true);
				}
			}
		}
	}else{
		tile.setColor(c);
	}
	this.updateCount();
	
}

Board.prototype.clearLocks = function(nextTurn) {
	
	//Pass in the turn it is switching to
	
	for (var i=0;i<this.count;i++) {
		if (this.tiles[i].color == nextTurn && this.tiles[i].locked) {
			this.tiles[i].setLock(false);
		}
	}
	
}