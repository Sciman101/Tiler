var preload = {
	preload: function() {
		
		//Set game background
		this.stage.backgroundColor = colors.background;
		
		//Load in assets
		game.load.atlas('sprites','assets/sprites.png?v=1','assets/sprites.json?v=1',Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
		
		//Set scaling mode
		//  This sets a limit on the up-scale
		game.scale.maxWidth = 800;
		game.scale.maxHeight = 800;

		//  Then we tell Phaser that we want it to scale up to whatever the browser can handle, but to do it proportionally
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.refresh();
		
		
	},
	create: function() {
		//Start menu state
		this.state.start('Menu');
	}
}