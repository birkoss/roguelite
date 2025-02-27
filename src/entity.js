import Phaser from './lib/phaser.js';

import { DUNGEON_ASSET_KEYS } from './keys/asset.js';

export const ENTITY_TYPE = Object.freeze({
    STAIR: 'STAIR',
    CHEST: 'CHEST',
    GOLD: 'GOLD',
    FOOD: 'FOOD',
});

export class Entity {
    /** @protected @type {number} */
    _x;
    /** @protected @type {number} */
    _y;
    /** @protected @type {Phaser.Scene} */
    _scene;
    /** @protected @type {keyof typeof ENTITY_TYPE} */
    _type;
    /** @protected @type {Phaser.GameObjects.Sprite} */
    _sprite;
    /** @protected @type {Phaser.GameObjects.Sprite} */
    _shadow;
    /** @protected @type {Object} */
    _details;

    _container;
    
    /**
     * @param {Phaser.Scene} scene
     * @param {keyof typeof ENTITY_TYPE} type
     * @param {number} x
     * @param {number} y
     * @param {Object} details
     */
    constructor(scene, type, x, y, details) {
        this._type = type;
        this._scene = scene;
        this._x = x;
        this._y = y;
        this._details = details;

        this._container = this._scene.add.container((x * 36) + 18, (y * 36) + 18);

        if (this._details.shadow) {
            this._shadow = this._scene.add.sprite(0, 0, DUNGEON_ASSET_KEYS.DUNGEON, 101);
            this._container.add(this._shadow);
        }

        this._sprite = this._scene.add.sprite(0, 0, DUNGEON_ASSET_KEYS.DUNGEON, this._details.frame);
        this._container.add(this._sprite);
    }
    
    /** @type {keyof typeof ENTITY_TYPE} */
    get type() { return this._type; }

    /** @type {Number} */
    get x() { return this._x; }

    /** @type {Number} */
    get y() { return this._y; }

    /** @type {Phaser.GameObjects.Image} */
    get gameObject() { return this._sprite; }

    use() {
        this._sprite.destroy();
        if (this._shadow) {
            this._shadow.destroy();
        }
    }
}
