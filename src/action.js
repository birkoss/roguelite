import { Unit } from "./unit.js";

export const ACTION_TYPE = Object.freeze({
    MOVE: 'MOVE',
    MELEE: 'MELEE',
});

export class Action {
    /** @type {Unit} */
    #unit;
    /** @type {keyof typeof ACTION_TYPE} */
    #type;
    #data;

    /**
     * @param {Unit} unit 
     * @param {keyof typeof ACTION_TYPE} type 
     */
    constructor(unit, type, data) {
        this.#unit = unit;
        this.#type = type;
        this.#data = data;
    }

    get unit() {
        return this.#unit;
    }

    get data() {
        return this.#data;
    }

    get type() {
        return this.#type;
    }
}
