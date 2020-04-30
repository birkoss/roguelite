class CustomButton extends Phaser.GameObjects.Container {
 
    constructor(scene) {
        super(scene);

        this.isPressed = this.isDisabled = false;

        this.background = new Phaser.GameObjects.Sprite(scene, 0, 0, "ui:long_buttons");
        this.background.setOrigin(0);
        this.add(this.background);

        this.background.on("pointerdown", this.onPointerDown, this);
        this.background.on("pointerup", this.onPointerUp, this);
        this.background.on("pointerout", this.onPointerOut, this);
    }

    disable() {
        this.isDisabled = true;
        this.alpha = 0.8;
    	this.background.disableInteractive();
    }

    enable() {
        this.isDisabled = false;
        this.alpha = 1;
        this.background.setInteractive();
    }    

    /* Events */

    onPointerUp() {
    	if (this.isPressed) {
            this.onPointerOut();
    		this.emit("BUTTON_CLICKED", this);
    	}
    }

    onPointerDown() {
        if (this.isPressed) {
            return;
        }
    	this.isPressed = true;
    	this.background.setFrame(1);
    }

    onPointerOut() {
    	this.isPressed = false;
        if (!this.isDisabled) {
            this.background.setFrame(0);
        }
    }
};