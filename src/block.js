import Phaser from "./lib/phaser.js";

export class Block {
    /** @type {number} */
    #color;
    /** @type {Phaser.GameObjects.Container} */
    #container;
    /** @type {Phaser.GameObjects.Sprite} */
    #background;
    /** @type {Phaser.GameObjects.Sprite} */
    #icon;

    constructor() {
        this.#color = -1;
    }

    get background() { return this.#background; }
    get color() { return this.#color; }
    get icon() { return this.#icon; }
    get container() { return this.#container; }

    // TODO: Move to a create method (pass in scene) and remove those setters
    set background(value) { this.#background = value; }
    set container(value) { this.#container = value; }
    set icon(value) { this.#icon = value; }

    /**
     * @param {number} newColor
     */
    updateColor(newColor) {
        this.#color = newColor;
        if (this.#icon) {
            this.#icon.setFrame(newColor);
        }
    }
}
