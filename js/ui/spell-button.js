class SpellButton extends CustomButton {
 
    constructor(scene) {
        super(scene);

        this.countdown = 0;
        this.countdownMax = 4;

        this.label = this.label = new Phaser.GameObjects.BitmapText(scene, 0, 0, "font:gui", "5", 30);
        this.label.setOrigin(0.5);
        this.add(this.label);

        this.background.setTexture("ui:small_buttons");

        this.enable();
    }

    enable() {
        if (this.countdown > 0) {
            this.countdown = Math.max(0, this.countdown - 1);
        }

        if (this.countdown <= 0) {
            this.label.setAlpha(0);
            super.enable();
        } else {
            this.disable();

            this.label.setAlpha(1);
            this.label.setText(this.countdown);
            this.label.x = (this.background.width/2) - 3;
            this.label.y = this.background.height/2;
        }
    }

    disable() {
        super.disable();
    }

    setCountdown() {
        this.countdown = this.countdownMax;
    }
};