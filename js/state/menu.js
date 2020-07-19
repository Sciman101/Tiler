MenuButton = function(game,x,y,color,func,ctx) {
	
	Phaser.Button.call(this,game,x,y,'sprites',func,ctx,'tile_big.png','tile_big.png','tile_big.png','tile_big.png');
	
	this.anchor.set(0.5);
	this.tint = color;
	
	this.label = this.game.add.text(0,0,'Undefined Label',this.textStyle);
	this.label.anchor.set(0.5);
	this.label.visible = false;
	
	this.addChild(this.label);
	
	game.add.existing(this);
}

MenuButton.prototype = Object.create(Phaser.Button.prototype);
MenuButton.prototype.constructor = MenuButton;
MenuButton.prototype.textStyle = { font: "bold 40px Arial", fill: "#CDFFC9", boundsAlignH: "center", boundsAlignV: "middle", align: "center" };
MenuButton.prototype.showLabel = function() {
	this.label.visible = true;
}
MenuButton.prototype.setLabelIncrement = function(text,val) {
	var l = text.length;
	this.label.text = '+\n' + text + ':\n' + val + '\n-';
	this.label.addColor("#E28060",0);
	this.label.addColor("#CDFFC9",1);
	this.label.addColor("#79B1C4",l+3);
}

var menu = {
	create: function() {
		
		//Create menu
		this.menuGroup = this.add.group();
		this.menuGroup.x = this.world.centerX;
		this.menuGroup.y = this.world.centerY;
		
		this.menuBottom = this.add.group();
		this.menuBottom.y = 128;
		this.menuGroup.add(this.menuBottom);
		
		this.menuTop = this.add.group();
		this.menuTop.y = -128;
		this.menuGroup.add(this.menuTop);
		
		//Create buttons
		this.buttons = [];
		for (var i=0;i<4;i++) {
			
			//Determine button color
			var c = colors.green;
			if (i == 1) c = colors.orange;
			if (i == 2) c = colors.blue;
			
			var b = new MenuButton(this.game,0,0,c,null,this);
			
			//Determine button position
			if (i % 2 == 0) {
				b.x = -128;
			}else{
				b.x = 128;
			}
			
			if (Math.floor(i/2) == 0) {
				this.menuTop.add(b);
			}else{
				this.menuBottom.add(b);
			}

			this.buttons.push(b);
			
			//Animate button
			TweenHelper.SpinExpand(b,750,i*300);
			
		}
		
		//Add title
		this.title = this.add.text(0,0,"T I L E R",{ font: "bold 120px Arial", fill: "#CDFFC9", boundsAlignH: "center", boundsAlignV: "middle" });
		this.title.anchor.set(0.5);
		
		this.title.stroke = "#7FC479";
		
		this.menuGroup.add(this.title);
		var t = TweenHelper.Expand(this.title,500,1200);
		
		t.onComplete.add(this.showMenu,this);
		
		//Game properties
		this.gameProperties = {
			boardSize: 4,
			multiplayer: false
		};
		
		//DEBUG
		//this.startGame();
		
	},
	showMenu: function() {
		
		//Animate all the menu crap
		this.add.tween(this.menuTop).to({x:-128},750,Phaser.Easing.Back.InOut,true);
		this.add.tween(this.menuBottom).to({x:128},750,Phaser.Easing.Back.InOut,true);
		
		var tween = this.add.tween(this.title).to({y:-300,strokeThickness:8,fontSize:84},750,Phaser.Easing.Back.InOut,true);
		
		tween.onComplete.add(this.showButtonLabels,this);
		
	},
	showButtonLabels: function() {
		
		for (var i=0;i<this.buttons.length;i++) {
			
			var b = this.buttons[i];
			
			//Assign button label and action
			switch (i) {
				case 0:
					b.setLabelIncrement('Board Size',4);
					b.onInputDown.add(this.incrementBoardSize,this);
					break;
				case 1:
					b.label.text = 'Play\nSingleplayer';
					b.onInputDown.add(this.startGameSingleplayer,this);
					break;
				case 2:
					b.label.text = 'Play\nMultiplayer';
					b.onInputDown.add(this.startGameMultiplayer,this);
					break;
				case 3:
					b.label.text = 'Blog';
					b.onInputDown.add(this.showBlog,this);
					break;
				
			}
			
			var tween = TweenHelper.Expand(b.label,500,i*300);
			tween.onStart.add(b.showLabel,b);
			
		}
		
	},
	incrementBoardSize: function() {
		
		var b = this.buttons[0].world.y;
		var mouseY = this.game.input.y;
		
		var size = this.gameProperties.boardSize + ((mouseY > b + 64) ? -1 : (mouseY < b - 64) ? 1 : 0);
		size = Math.min(Math.max(size,4),8);
		
		if (size != this.gameProperties.boardSize) {
			this.gameProperties.boardSize = size;
			console.log('New board size: ' + size);
			this.buttons[0].setLabelIncrement('Board Size',size);
			//Jiggle
			TweenHelper.Jiggle(this.buttons[0].label,250,0);
		}else{
			//Wiggle
			TweenHelper.Wiggle(this.buttons[0].label,250,0);
		}
		
	},
	showBlog: function() {
		window.open('http://sciman101-art.tumblr.com');
	},
	startGameSingleplayer: function() {
		this.gameProperties.multiplayer = false;
		this.startGameTransition();
	},
	startGameMultiplayer: function() {
		this.gameProperties.multiplayer = true;
		this.startGameTransition();
	},
	startGameTransition: function() {
		var tween = TweenHelper.Fade(this.menuGroup,1500,0);
		tween[0].onComplete.add(this.startGame,this);
	},
	startGame: function() {
		this.game.state.start('Main',true,false,this.gameProperties);
	}
}