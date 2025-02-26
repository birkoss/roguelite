import Phaser from './lib/phaser.js';

import { DUNGEON_ASSET_KEYS } from './keys/asset.js';

export const ENTITY_TYPE = Object.freeze({
    STAIR: 'STAIR',
    CHEST: 'CHEST',
});

export class Entity {
    /** @protected @type {number} */
    _x;
    /** @protected @type {number} */
    _y;
    /** @protected @type {UnitDetails} */
    _details;
    /** @protected @type {Phaser.Scene} */
    _scene;
    /** @protected @type {keyof typeof ENTITY_TYPE} */
    _type;
    /** @protected @type {Phaser.GameObjects.Sprite} */
    _phaserGameObject;
    
    /**
     * @param {Phaser.Scene} scene
     * @param {keyof typeof ENTITY_TYPE} type
     * @param {number} x
     * @param {number} y
     * @param {UnitDetails} details */
    constructor(scene, type, x, y, details) {
        this._type = type;
        this._scene = scene;
        this._x = x;
        this._y = y;
        this._details = details;

        this._phaserGameObject = this._scene.add.sprite((x * 36) + 18, (y * 36) + 18, DUNGEON_ASSET_KEYS.DUNGEON, 46);
    }
    
    /** @type {keyof typeof ENTITY_TYPE} */
    get type() { return this._type; }

    /** @type {Number} */
    get x() { return this._x; }

    /** @type {Number} */
    get y() { return this._y; }

    /** @type {Phaser.GameObjects.Image} */
    get gameObject() { return this._phaserGameObject; }
}
