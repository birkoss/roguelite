class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MainScene'
        });
    }

    init(config) {
        this.levelConfig = config;
    }

    create() {
        this.map = new Map(this, 7, 10);

        this.map.x = (this.game.config.width - this.map.getBounds().width) / 2;
        this.map.y = this.map.x;

        this.button = this.add.sprite(200, 600, "tileset:world", 200);

        this.button.setInteractive();
        this.button.on("pointerdown", this.onButtonDown, this);
    }

    onButtonDown() {
        this.map.onActionClicked({
            type: Action.SPELL,
            spell: "WARP"
        });
    }
};