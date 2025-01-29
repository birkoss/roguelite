import { PANEL_ASSET_KEYS, UNIT_ASSET_KEYS } from "./keys/asset.js";

export class Panel {

    static #CONFIG = {
        width: 0,
        height: 168,
        padding: 5,
        colors: {
            background: 0x333333,
            frameBorder: 0x000000,
            frameEnemy: 0x9e2b18,
            framePlayer: 0x139c13,
            line: 0x646464,
            shadow: 0x000000,
            health: 0xd40200,
            mana: 0x5487ff,
            coin: 0x8c7533,
            
            enemy: 0x4db02f,
            player: 0x07bafc,
        }
    };

    /** @type {Phaser.Scene} */
    #scene;
    #container;
    #config;

    #units;

    #stats;
    #statsText;

    /**
     * @param {Phaser.Scene} scene - The scene this panel belongs to
     * @param {number} x - The x coordinate of the tile on the grid
     * @param {number} y - The y coordinate of the tile on the grid
     */
    constructor(scene, x, y) {
        this.#scene = scene;
        this.#container = scene.add.container(x, y);

        this.#config = {
            ...Panel.#CONFIG,
            width: this.#scene.game.canvas.width,
        };

        this.#container.add([
            this.#createBackground(0, this.#config.height, this.#config.colors.background),
            this.#createBackground(174, 2, this.#config.colors.line),
            this.#createBackground(176, 16, this.#config.colors.shadow, 0.2),

            scene.add.sprite(0, 24, PANEL_ASSET_KEYS.BACKGROUND).setOrigin(0).setTint(0x595d8c),
        ]);

        this.#units = [];
        this.#statsText = [];

        // TODO: Wizard should start at full mana
        this.#stats = [
            {
                'health': 10,
                'maxHealth': 10,
                'mana': 0,
                'maxMana': 10,
                'coin': 0,
            },
            {
                'health': 10,
                'maxHealth': 10,
                'mana': 0,
                'maxMana': 0,
                'coin': 0,
            }
        ];

        this.#createStatPanel("Your Knight", 0, this.#stats[0]);
        this.#createStatPanel("Goblin", 195, this.#stats[1], true);
    }

    isPlayerDead() {
        return this.#stats[0].health === 0;
    }

    isEnemyDead() {
        return this.#stats[1].health === 0;
    }

    updateStats(stats) {
        for (let key in stats) {
            if (key === 'attack') {
                this.#stats[1].health = Math.max(this.#stats[1].health - stats[key], 0);
                this.#statsText[1][0].setText(this.#stats[1].health + "/" + this.#stats[1].maxHealth);
            } else if (key === 'coin') {
                this.#stats[0].coin += stats[key];
                this.#statsText[0][2].setText(this.#stats[0].coin);
            } else if (key === 'mana') {
                this.#stats[0].mana += stats[key];
                this.#statsText[0][1].setText(this.#stats[0].mana + "/" + this.#stats[0].maxMana);
            } else if (key === 'health') {
                this.#stats[0].health = Math.min(this.#stats[0].health + stats[key], this.#stats[0].maxHealth);
                this.#statsText[0][0].setText(this.#stats[0].health + "/" + this.#stats[0].maxHealth);
            } else if (key === 'damage') {
                this.#stats[0].health = Math.max(this.#stats[0].health - stats[key], 0);
                this.#statsText[0][0].setText(this.#stats[0].health + "/" + this.#stats[0].maxHealth);
            }
        }
        console.log(stats);
    }

    #createBackground(y, height, color, alpha = 1) {
        return this.#scene.add.rectangle(
            0, y, 
            this.#config.width, 
            height, 
            color
        ).setOrigin(0, 0).setAlpha(alpha);
    }

    #createIcon(x, y, frame, tint, scale = 2) {
        return this.#scene.add.sprite(x, y, PANEL_ASSET_KEYS.ICON, frame)
            .setOrigin(0)
            .setTint(tint)
            .setScale(scale);
    }

    #createText(x, y, text, size = 20, alpha = 1) {
        return this.#scene.add.bitmapText(
            x, y, 
            PANEL_ASSET_KEYS.FONT, 
            text, 
            size
        ).setTint(this.#config.colors.text)
         .setOrigin(0)
         .setAlpha(alpha);
    }

    #createStatPanel(unitName, unitFrame, unitStats, isRight = false) {
        const origin = (isRight ? 1 : 0);

        // Create the frame for the name
        const frameNameY = (isRight ? 0 : 150);
        const frameColor = (isRight ? this.#config.colors.frameEnemy : this.#config.colors.framePlayer);
        this.#container.add(this.#createBackground(frameNameY, 24, this.#config.colors.frameBorder));
        this.#container.add(this.#createBackground(frameNameY+4, 16, frameColor));

        // Create the name
        const name = this.#scene.add.bitmapText(0, frameNameY + 1, PANEL_ASSET_KEYS.FONT, unitName, 20).setTint(0xffffff).setOrigin(origin, 0);
        name.x = (isRight ? this.#scene.game.canvas.width - this.#config.padding : this.#config.padding);
        this.#container.add(name);

        const unitY = 124;
        const unitColor = (isRight ? this.#config.colors.enemy : this.#config.colors.player);
        const unitX = this.#config.width / 2 + (isRight ? 50 : -50);

        // Create the unit shadow
        const unitShadow = this.#scene.add.sprite(unitX - 2, unitY, UNIT_ASSET_KEYS.BACKGROUND, unitFrame).setOrigin(0.5).setTint(this.#config.colors.shadow);
        if (!isRight) {
            unitShadow.scaleX = -1;
        }
        this.#container.add(unitShadow);

        // Create the unit
        const unit = this.#scene.add.sprite(unitX, unitY, UNIT_ASSET_KEYS.BACKGROUND, unitFrame).setOrigin(0.5).setTint(unitColor);
        if (!isRight) {
            unit.scaleX = -1;
        }
        this.#container.add(unit);
        this.#units.push(unit);

        const xPos = isRight ? this.#config.width : this.#config.padding;

        const bg = this.#createBackground(24, 120, this.#config.colors.shadow, 0.3);
        bg.width = 40;
        bg.setOrigin(origin, 0);
        bg.x = xPos + (isRight ? 0 : -this.#config.padding);
        this.#container.add(bg);

        const stats = [
            { frame: 0, color: this.#config.colors.health, text: unitStats.health + "/" + unitStats.maxHealth },
        ];
        if (unitStats.maxMana > 0) {
            stats.push({ frame: 1, color: this.#config.colors.mana, text: unitStats.mana + "/" + unitStats.maxMana });
        }
        if (!isRight) {
            stats.push({ frame: 2, color: this.#config.colors.coin, text: unitStats.coin });
        }

        const labels = [];
        stats.forEach((singleStat, index) => {
            const y = 26 + (index * 42);
            const icon = this.#createIcon(xPos - (isRight ? 4 : 0), y, singleStat.frame, singleStat.color);
            icon.setOrigin(origin, 0);
            
            const label = this.#createText(xPos - (isRight ? 45 : -45), y + 3, singleStat.text, 30, 0.8);
            label.setOrigin(origin, 0);
            
            this.#container.add([icon, label]);

            labels.push(label);
        });

        this.#statsText.push(labels);
    }

}
