import Phaser from "./lib/phaser.js";

export class Tile {
    /** @type {number} */
    #x;
    /** @type {number} */
    #y;
    /** @type {number} */
    #color;
    /** @type {Phaser.GameObjects.Sprite} */
    #sprite;
    /** @type {boolean} */
    #isEmpty;
    /** @type {boolean} */
    #toRemove;

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} color 
     * @param {Phaser.GameObjects.Sprite} sprite 
     * @param {boolean} [isEmpty] 
     * @param {boolean} [toRemove] 
     */
    constructor(x, y, color, sprite, isEmpty = false, toRemove = false) {
        this.#x = x;
        this.#y = y;
        this.#color = color;
        this.#sprite = sprite;

        this.#isEmpty = isEmpty;
        this.#toRemove = toRemove;
    }

    get x() {
        return this.#x;
    }
    set x(value) {
        this.#x = value;
    }

    get y() {
        return this.#y;
    }
    set y(value) {
        this.#y = value;
    }

    get color() {
        return this.#color;
    }
    set color(value) {
        this.#color = value;
    }

    get sprite() {
        return this.#sprite;
    }
    set sprite(value) {
        this.#sprite = value;
    }

    get isEmpty() {
        return this.#isEmpty;
    }
    set isEmpty(value) {
        this.#isEmpty = value;
    }

    get toRemove() {
        return this.#toRemove;
    }
    set toRemove(value) {
        this.#toRemove = value;
    }
}
