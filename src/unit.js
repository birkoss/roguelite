import Phaser from './lib/phaser.js';

import { DUNGEON_ASSET_KEYS, UNIT_ASSET_KEYS } from './keys/asset.js';

export const UNIT_TYPES = Object.freeze({
    PLAYER: 'PLAYER',
    ENEMY: 'ENEMY',
});

// @TODO: Inherit from Entity
export class Unit {
    /** @protected @type {number} */
    _x;
    /** @protected @type {number} */
    _y;
    /** @protected @type {UnitDetails} */
    _details;
    /** @protected @type {Phaser.Scene} */
    _scene;
    /** @protected @type {keyof typeof UNIT_TYPES} */
    _type;
    /** @protected @type {boolean} */
    _isActive;
    /** @protected @type {Phaser.GameObjects.Sprite} */
    _sprite;
    /** @protected @type {Phaser.GameObjects.Sprite} */
    _shadow;

    _container;

    /** @protected @type {number} */
    _hp;

    /**
     * @param {Phaser.Scene} scene
     * @param {keyof typeof UNIT_TYPES} type
     * @param {number} x
     * @param {number} y
     * @param {UnitDetails} details */
    constructor(scene, type, x, y, details) {
        this._type = type;
        this._scene = scene;
        this._x = x;
        this._y = y;
        this._details = details;

        this._hp = details.hp;
        this._attack = details.attack;

        this._isActive = (this._type === UNIT_TYPES.PLAYER);

        this._container = this._scene.add.container((x * 36) + 18, (y * 36) + 18);

        this._shadow = this._scene.add.sprite(0, 0, DUNGEON_ASSET_KEYS.DUNGEON, 101);
        this._container.add(this._shadow);
        this._sprite = this._scene.add.sprite(0, 0, UNIT_ASSET_KEYS.UNIT, 0);
        this._container.add(this._sprite);

        const assetBaseFrame = this._details.assetBaseFrame;
        
        this.#createAnimation('idleRight', [assetBaseFrame, assetBaseFrame + 4]);
        this.#createAnimation('idleBottom', [assetBaseFrame + 1, assetBaseFrame + 5]);
        this.#createAnimation('idleTop', [assetBaseFrame + 2, assetBaseFrame + 6]);
        this.#createAnimation('idleLeft', [assetBaseFrame + 3, assetBaseFrame + 7]);

        this.#createAnimation('attackRight', this._details.assetFramesAttackRight, false);
        this.#createAnimation('attackTop', this._details.assetFramesAttackTop, false);
        this.#createAnimation('attackBottom', this._details.assetFramesAttackBottom, false);
        this.#createAnimation('attackLeft', this._details.assetFramesAttackLeft, false);

        this._sprite.anims.play('idleRight');
        
    }
    
    /** @type {keyof typeof UNIT_TYPES} */
    get type() {
        return this._type;
    }

    /** @type {Number} */
    get x() {
        return this._x;
    }

    /** @type {Number} */
    get y() {
        return this._y;
    }

    /** @type {boolean} */
    get isActive() {
        return this._isActive;
    }

    get isAlive() {
        return this._hp > 0;
    }

    /** @type {Phaser.GameObjects.Image} */
    get gameObject() {
        return this._sprite;
    }

    get container() {
        return this._container;
    }

    activate() {
        this._isActive = true;
        this.gameObject.setAlpha(1);
    }

    face(direction) {
        this._sprite.anims.play("idle" + direction);
    }

    /**
     * @param {number} x
     * @param {number} y 
     * @param {() => void} [callback]
     */
    move(x, y, callback) {
        let newAnimationKey = this._sprite.anims.currentAnim.key;

        if (y == this.y) {
            newAnimationKey = "idle" + (x > this.x ? 'Right' : 'Left');
        } else if (x == this.x) {
            newAnimationKey = "idle" + (y > this.y ? 'Bottom' : 'Top');
        }

        if (newAnimationKey !== this._sprite.anims.currentAnim.key) {
            this._sprite.anims.play(newAnimationKey);
        }

        this._x = x;
        this._y = y;

        let newX = (x * 36) + 18;
        let newY = (y * 36) + 18;

        this._scene.tweens.add({
            targets: this.container,
            x: newX,
            y: newY,
            duration: 100,
            ease: Phaser.Math.Easing.Sine.Out,
            onComplete: callback
        });

        this._scene.tweens.add({
            targets: this.container,
            x: newX,
            y: newY,
            duration: 100,
            ease: Phaser.Math.Easing.Sine.Out,
            onComplete: callback
        });
    }

    /**
     * @param {Unit} defender
     * @param {() => void} [callback]
     */
    attackUnit(defender, callback) {
        let newAnimationKey = this._sprite.anims.currentAnim.key;

        if (defender.y == this.y) {
            newAnimationKey = (defender.x > this.x ? 'Right' : 'Left');
        } else if (defender.x == this.x) {
            newAnimationKey = (defender.y > this.y ? 'Bottom' : 'Top');
        }

        this._scene.time.delayedCall(200, () => {
            defender.takeDamage(this._attack);
        });

        this._sprite.anims.play("attack" + newAnimationKey).once('animationcomplete', () => {
            this._sprite.anims.play("idle" + newAnimationKey);

            callback();
         });
    }

    takeDamage(amount) {
        console.log(amount);
        this._hp = Math.max(this._hp - amount, 0);

        this._sprite.setTint(0xff0000);

        this._scene.time.delayedCall(400, () => {
            this._sprite.setTint(0xffffff);

            if (!this.isAlive) {
                this._sprite.anims.stop();
                console.log(this._details.assetDeadFrame);
                this._sprite.setFrame(this._details.assetDeadFrame);
            }
        });
    }

    #createAnimation = (key, frames, loop = true) => {
        this._sprite.anims.create({
            key: key,
            frames: this._sprite.anims.generateFrameNumbers(UNIT_ASSET_KEYS.UNIT, { frames: frames }),
            frameRate: (loop ? 2 : 5),
            repeat: (loop ? -1 : 0),
        });
    };
}
