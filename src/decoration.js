import Phaser from './lib/phaser.js';

import { DUNGEON_ASSET_KEYS, UI_ASSET_KEYS, UNIT_ASSET_KEYS } from './keys/asset.js';

// @TODO: Inherit from Entity
export class Decoration {
    /** @protected @type {number} */
    _x;
    /** @protected @type {number} */
    _y;
    /** @protected @type {Phaser.Scene} */
    _scene;

    /** @protected @type {Phaser.GameObjects.Sprite} */
    _sprite;
    /** @protected @type {Phaser.GameObjects.Sprite} */
    _shadow;
    /** @protected @type {Phaser.GameObjects.Container} */
    _container;

    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {number[]} frames
     */
    constructor(scene, x, y, frames) {
        this._scene = scene;
        this._x = x;
        this._y = y;

        this._container = this._scene.add.container((x * 36) + 18, (y * 36) + 18);

        this._sprite = this._scene.add.sprite(0, 0, DUNGEON_ASSET_KEYS.DUNGEON, frames[0]);
        this._container.add(this._sprite);

        this.#createAnimation('idle', frames);

        this._sprite.anims.play('idle');
    }
    
    /** @type {Number} */
    get x() { return this._x; }

    /** @type {Number} */
    get y() { return this._y; }

    /** @type {Phaser.GameObjects.Sprite} */
    get gameObject() { return this._sprite; }

    /** @type {Phaser.GameObjects.Container} */
    get container() { return this._container; }

    #createAnimation = (key, frames, loop = true) => {
        this._sprite.anims.create({
            key: key,
            frames: this._sprite.anims.generateFrameNumbers(DUNGEON_ASSET_KEYS.DUNGEON, { frames: frames }),
            frameRate: (loop ? 2 : 5),
            repeat: (loop ? -1 : 0),
        });
    };
}
