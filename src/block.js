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

    constructor(container, background, icon) {
        this.#color = -1;

        this.#container = container;
        this.#background = background;
        this.#icon = icon;
    }

    get background() { return this.#background; }
    get color() { return this.#color; }
    get icon() { return this.#icon; }
    get container() { return this.#container; }



    highlight() {
        this.#background.setFrame(1);
    }
    
    unhighlight() {
        this.#background.setFrame(0);
    }

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
