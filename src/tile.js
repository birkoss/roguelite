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
     * @param {number} x - The x coordinate of the tile on the grid
     * @param {number} y - The y coordinate of the tile on the grid
     */
    constructor(x, y) {
        this.#position = {x, y};

        this.#block = new Block();

        this.#state = {isEmpty: false, toRemove: false};
    }

    // TODO: Stop accessing the block directly (color and container)
    get block() { return this.#block; }
    get color() { return this.#block.color; }
    get isEmpty() { return this.#state.isEmpty; }
    get container() { return this.#block.container; }
    get toRemove() { return this.#state.toRemove; }
    get x() { return this.#position.x; }
    get y() { return this.#position.y; }

    set block(value) { this.#block = value; }

    /**
     * @param {Partial<TileState>} newState
     */
    updateState(newState) {
        Object.assign(this.#state, newState);
    }
}
