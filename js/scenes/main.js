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

        this.spells = ['WARP','QUAKE','MAELSTROM','MULLIGAN'];

        let x = 50;

        this.spells.forEach(single_spell => {
            let btn = new SpellButton(this);
            btn.on("BUTTON_CLICKED", this.onSpellBtnClicked, this);
            btn.x = x;
            btn.y = 600;
            btn.spell = "WARP";
            this.add.existing(btn);
            this.buttons.push(btn);

            x += btn.getBounds().width + 40;
        });
    }

    onSpellBtnClicked(btn) {
        btn.setCountdown();
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