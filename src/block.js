import Phaser from "./lib/phaser.js";

export class Block {
    /** @type {number} */
    #color;
    /** @type {Phaser.GameObjects.Container} */
    #container;
    /**
     * @type {Phaser.GameObjects.Sprite}
     */
    #background;
    /**
     * @type {Phaser.GameObjects.Sprite}
     */
    #icon;

    constructor() {
        this.#color = -1;
    }

    get background() { return this.#background; }
    get color() { return this.#color; }
    get icon() { return this.#icon; }
    get container() { return this.#container; }

    set background(value) { this.#background = value; }
    set color(value) { this.#color = value; }
    set container(value) { this.#container = value; }
    set icon(value) { this.#icon = value; }
}
