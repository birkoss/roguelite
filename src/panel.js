import { Block } from "./block.js";
import { UI_ASSET_KEYS, UNIT_ASSET_KEYS } from "./keys/asset.js";

export class Panel {
    /** @type {Phaser.Scene} */
    #scene;
    #container;

    #textHealth;
    #textCoin;
    #textMana;
    #textEnemy;

    /**
     * @param {number} x - The x coordinate of the tile on the grid
     * @param {number} y - The y coordinate of the tile on the grid
     */
    constructor(scene, x, y) {
        this.#scene = scene;

        this.#container = scene.add.container(x, y);

        let background = scene.add.rectangle(0, 0, this.#scene.game.canvas.width, 140, 0x000000).setOrigin(0, 0);
        this.#container.add(background);

        let line = scene.add.rectangle(0, background.y + background.height, this.#scene.game.canvas.width, 2, 0x646464).setOrigin(0, 0);
        this.#container.add(line);

        let shadow = scene.add.rectangle(0, line.y + line.height, this.#scene.game.canvas.width, 16, 0x000000, 0.2).setOrigin(0, 0);
        this.#container.add(shadow);

        this.#textCoin = scene.add.bitmapText(100, 25, UI_ASSET_KEYS.LARGE_FONT, 'COIN:10', 21).setTint(0x646464).setOrigin(0);
        this.#container.add(this.#textCoin);
        this.#textMana = scene.add.bitmapText(100, 47, UI_ASSET_KEYS.LARGE_FONT, 'MANA:10', 21).setTint(0x646464).setOrigin(0);
        this.#container.add(this.#textMana);

        let avatar = scene.add.sprite(10, 10, UNIT_ASSET_KEYS.AVATAR).setOrigin(0).setAlpha(0.7);
        this.#container.add(avatar);

        this.#textHealth = scene.add.bitmapText(avatar.x + avatar.width/2, avatar.y + avatar.height, UI_ASSET_KEYS.LARGE_FONT, "HP\n10", 21).setTint(0x646464).setOrigin(0.5, 0);
        this.#container.add(this.#textHealth);

        avatar = scene.add.sprite(0, 10, UNIT_ASSET_KEYS.AVATAR, 1).setOrigin(1, 0).setAlpha(0.7);
        avatar.x = this.#scene.game.canvas.width - 10;
        this.#container.add(avatar);

        this.#textEnemy = scene.add.bitmapText(0, avatar.y + avatar.height, UI_ASSET_KEYS.LARGE_FONT, "HP\n20", 21).setTint(0x646464).setOrigin(0.5, 0);
        this.#textEnemy.x = this.#scene.game.canvas.width - 5 - avatar.width / 2;
        this.#container.add(this.#textEnemy);
    }
}
