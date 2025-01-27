import Phaser from "./lib/phaser.js";

import { Block } from "./block.js";

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

    /** @type {Block} */
    #block;

    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.updatePosition(x, y);

        this.#block = new Block();

        this.#state = {isEmpty: false, toRemove: false};
    }

    get block() { return this.#block; }
    get color() { return this.#block.color; }
    get isEmpty() { return this.#state.isEmpty; }
    get container() { return this.#block.container; }
    get toRemove() { return this.#state.toRemove; }
    get x() { return this.#position.x; }
    get y() { return this.#position.y; }

    set block(value) { this.#block = value; }
    set color(value) { this.#block.color = value; }

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
