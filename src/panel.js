import { Block } from "./block.js";
import { UI_ASSET_KEYS } from "./keys/asset.js";

export class Panel {
    /** @type {Phaser.Scene} */
    #scene;
    #container;

    #textHealth;
    #textCoin;
    #textMana;

    /**
     * @param {number} x - The x coordinate of the tile on the grid
     * @param {number} y - The y coordinate of the tile on the grid
     */
    constructor(scene, x, y) {
        this.#scene = scene;

        this.#container = scene.add.container(x, y);

        let background = scene.add.rectangle(0, 0, this.#scene.game.canvas.width, 80, 0x000000).setOrigin(0, 0);
        this.#container.add(background);

        let line = scene.add.rectangle(0, 80, this.#scene.game.canvas.width, 2, 0x646464).setOrigin(0, 0);
        this.#container.add(line);

        let shadow = scene.add.rectangle(0, 82, this.#scene.game.canvas.width, 16, 0x000000, 0.2).setOrigin(0, 0);
        this.#container.add(shadow);

        // let text = this.add.bitmapText(0, 0, UI_ASSET_KEYS.LARGE_FONT, "+" + tile.block.value, 24).setTint(0xffffff).setOrigin(0.5, 0.5); 
        this.#textHealth = scene.add.bitmapText(10, 10, UI_ASSET_KEYS.LARGE_FONT, 'HP:10', 21).setTint(0xffffff).setOrigin(0);
        this.#container.add(this.#textHealth);
    }
}
