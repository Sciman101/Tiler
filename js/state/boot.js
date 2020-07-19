var boot = {
	create: function() {
		console.log("Booting game");
		//this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.refresh();
		
		this.game.input.maxPointers = 1;
		
		this.game.state.start('Preload');
	}
}