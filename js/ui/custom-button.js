class CustomButton extends Phaser.GameObjects.Container {
 
    constructor(scene, text, type) {
        super(scene);

        this.isPressed = this.isDisabled = false;

        this.background = new Phaser.GameObjects.Sprite(scene, 0, 0, "ui:long_buttons");
        this.background.setOrigin(0);
        this.add(this.background);

        this.cost = 0;
        this.level = 1;

        this.label = new Phaser.GameObjects.BitmapText(scene, this.background.width / 2, this.background.height / 2, "font:gui", text, 20);
        this.label.setOrigin(0.5);
        this.label.tint = 0xd4d8e9;
        this.label.originalY = this.label.y;
        this.add(this.label);

        this.background.setInteractive();
        this.background.on("pointerdown", () => this.onPointerDown());
        this.background.on("pointerup", () => this.onPointerUp());
        this.background.on("pointerout", () => this.onPointerOut());
    }

    getCost() {
        return Math.ceil(this.cost + (this.level * 1.46));
    }

    setLabel(label) {
        this.label.setText("A:" + label + ", C:" + this.getCost());
    }

    disable() {
        this.isDisabled = true;
        this.alpha = 0.8;
        this.label.tint = 0x727685;
    	this.background.disableInteractive();
    }

    /* Events */

    onPointerUp() {
    	if (this.isPressed) {
    		this.emit("BUTTON_CLICKED", this);
    	}
    	this.onPointerOut();
    }

    onPointerDown() {
    	this.isPressed = true;
    	this.background.setFrame(2);
        this.label.y = this.label.originalY + 4;
    }

    onPointerOut() {
    	this.isPressed = false;
        if (!this.isDisabled) {
            this.label.y = this.label.originalY;
            this.background.setFrame(0);
        }
    }
};