import Phaser from "./lib/phaser.js";

/**
 * @typedef {Object} TilePosition
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} TileState
 * @property {boolean} isEmpty
 * @property {boolean} toRemove
 */

export class Tile {
    /** @type {TilePosition} */
    #position;
    /** @type {TileState} */
    #state;
    /** @type {number} */
    #color;
    /** @type {Phaser.GameObjects.Sprite} */
    #sprite;

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} color 
     * @param {Phaser.GameObjects.Sprite} sprite 
     */
    constructor(x, y, color, sprite) {
        this.updatePosition(x, y);

        this.#color = color;
        this.#sprite = sprite;

        this.#state = {isEmpty: false, toRemove: false};
    }

    get color() { return this.#color; }
    get isEmpty() { return this.#state.isEmpty; }
    get sprite() { return this.#sprite; }
    get toRemove() { return this.#state.toRemove; }
    get x() { return this.#position.x; }
    get y() { return this.#position.y; }

    set color(value) { this.#color = value; }
    set sprite(value) { this.#sprite = value; }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    updatePosition(x, y) {
        this.#position = {x, y};
    }

    /**
     * @param {Partial<TileState>} newState
     */
    updateState(newState) {
        Object.assign(this.#state, newState);
    }
}
