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
        this.map.on("END_TURN", this.nextTurn, this);

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
            btn.spell = single_spell;
            this.add.existing(btn);
            this.buttons.push(btn);

            x += btn.getBounds().width + 40;
        });

        this.anims.create({
            key: "attack",
            frames: [{
                frame: 10,
                key: "tileset:effectsLarge"
            },{
                frame: 11,
                key: "tileset:effectsLarge"
            }],
            frameRate: 30,
            yoyo: true,
            repeat: 2
        });

        this.anims.create({
            key: "heal",
            frames: [{
                frame: 26,
                key: "tileset:effectsSmall"
            },{
                frame: 27,
                key: "tileset:effectsSmall"
            },{
                frame: 28,
                key: "tileset:effectsSmall"
            },{
                frame: 29,
                key: "tileset:effectsSmall"
            }],
            frameRate: 20,
            yoyo: true,
            repeat: 1
        });

        this.anims.create({
            key: "warp",
            frames: [{
                frame: 5,
                key: "tileset:effectsSmall"
            },{
                frame: 6,
                key: "tileset:effectsSmall"
            },{
                frame: 7,
                key: "tileset:effectsSmall"
            },{
                frame: 8,
                key: "tileset:effectsSmall"
            },{
                frame: 9,
                key: "tileset:effectsSmall"
            }],
            frameRate: 20,
            yoyo: true,
            repeat: 1
        });

        this.turns = [];
        this.nextTurn();
    }

    generateTurns() {
        this.turns.push(this.map.player);

        this.map.enemies.forEach(single_enemy => {
            if (single_enemy.isAlive()) {
                this.turns.push(single_enemy);
            }
        });
    }

    nextTurn() {
        if (!this.map.player.isAlive()) {
            alert("YOU ARE DEAD!!!");
            return;
        }

        /* The Turns are empty, fill it again with the remaining units */
        if (this.turns.length == 0) {
            this.generateTurns();
        }

        let unit = this.turns.shift();
        if (unit.isAlive()) {
            this.map.bringToTop(unit);

            if (unit.type == Unit.PLAYER) {
                this.map.showActions();
            } else {
                this.controlUnit(unit);
            }
        } else {
            this.nextTurn();
        }
    }

    controlUnit(single_enemy) {
        // Can it attack the player ?
        let diff = this.map.getDistanceBetweenUnit(this.map.player, single_enemy);

        if (diff == 1) {
            this.cameras.main.shake(500);
            this.map.attackUnit(single_enemy, this.map.player, this.nextTurn, this);
        } else {
            let pf = new Pathfinding(this.map.export(), this.map.config.width, this.map.config.height);
            let tiles = pf.find({
                x: single_enemy.gridX,
                y: single_enemy.gridY
            }, {
                x: this.map.player.gridX,
                y: this.map.player.gridY
            });

            if (tiles.length > 1) {
                let neighboor = tiles[0];
                single_enemy.move(neighboor.x, neighboor.y);
            } else {
                this.nextTurn();
            }
        }
    }

    /* Events */

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