class PopupButton extends CustomButton {
 
    constructor(scene, text) {
        super(scene);

        this.label = this.label = new Phaser.GameObjects.BitmapText(scene, 0, 0, "font:gui", text, 20);
        this.label.setOrigin(0.5);
        this.label.x = (this.background.width / 2);
        this.label.y = (this.background.height / 2);
        this.label.originalY = this.label.y;
        this.label.setTint(0xd4d8e9);
        this.add(this.label);

        this.enable();
    }

    onPointerUp() {
        this.label.y = this.label.originalY;
        super.onPointerUp();
    }

    onPointerDown() {
        super.onPointerDown();
        this.label.y += 3;
    }

    onPointerOut() {
        super.onPointerOut();
        this.label.y = this.label.originalY;
    }
};