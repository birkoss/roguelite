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
        this.map.on("PLAYER_TURN_START", this.onMapPlayerTurnStarted, this);
        this.map.on("PLAYER_TURN_END", this.onMapPlayerTurnEnded, this);

        this.map.x = (this.game.config.width - this.map.getBounds().width) / 2;
        this.map.y = this.map.x;


        this.buttons = [];

        let btn = new SpellButton(this);
        btn.on("BUTTON_CLICKED", this.onSpellBtnClicked, this);
        btn.x = 250;
        btn.y = 600;
        btn.spell = "WARP";
        this.add.existing(btn);
        this.buttons.push(btn);

        btn = new SpellButton(this);
        btn.on("BUTTON_CLICKED", this.onSpellBtnClicked, this);
        btn.x = 320;
        btn.y = 600;
        btn.spell = "QUAKE";
        this.add.existing(btn);
        this.buttons.push(btn);
    }

    onSpellBtnClicked(btn) {
        this.map.onActionClicked({
            type: Action.SPELL,
            spell: btn.spell
        });
    }

    onMapPlayerTurnStarted() {
        this.buttons.forEach(single_button => {
            single_button.enable();
        });
    }

    onMapPlayerTurnEnded() {
        this.buttons.forEach(single_button => {
            single_button.disable();
        });
    }
};