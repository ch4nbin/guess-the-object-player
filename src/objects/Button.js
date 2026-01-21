export class Button {

    // constructor takes in the scene, text, function to go to, and position
    constructor(scene, x, y, text, colorPrimary, colorHover, colorText, callFunction) { // take x and y as a percent
        this.scene = scene;
        this.xPct = x;
        this.yPct = y;
        x = x * scene.scale.width;
        y = y * scene.scale.height;
        this.button = scene.add.text(x, y, text, {
            fontSize: '24px', fontFamily: 'ArcadeFont', color: colorText, 
            backgroundColor: colorPrimary, 
            padding: {x: 16, y: 10}})
            .setOrigin(0.5)
            .setResolution(2)
            .setInteractive({useHandCursor: true});

            // different options for the button
            // button is clicked so run function
            this.button.on('pointerdown', () => {(callFunction())});

            // button is hovered over so change cursor
            this.button.on('pointerover', () => 
            {this.button.setStyle({backgroundColor: colorHover}),
            this.button.setScale(this.scale + 0.1);});

            // button is not in use
            this.button.on('pointerout', () => 
            {this.button.setStyle({backgroundColor: colorPrimary}),
        this.button.setScale(this.scale - 0.1);});

        this.button.setScale((window.innerWidth / 900), 2 * (window.innerHeight / 900));
        this.scale = this.button.scale;
        console.log('Button created:', text, x, y);

        this.button.setDepth(1000);

    }

    // places the button
    resize() {
        this.button.scaleY = 2 * (window.innerHeight / 900);
        this.button.scaleX = window.innerWidth / 900;
        this.button.setPosition(
            this.xPct * this.scene.scale.width,
            this.yPct * this.scene.scale.height
        );
    }
    // call when button needs to be destroyed
    destroy() {
        this.button.destroy();
    }
}