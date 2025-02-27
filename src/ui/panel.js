import Phaser from "../lib/phaser.js";

import { UI_ASSET_KEYS } from "../keys/asset.js";

export class Panel {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Phaser.GameObjects.Container} */
    #container;

    /** @type {Phaser.GameObjects.BitmapText} */
    #textHp;
    /** @type {Phaser.GameObjects.BitmapText} */
    #textEnergy;
    /** @type {Phaser.GameObjects.BitmapText} */
    #textGold;


    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        this.#scene = scene;

        this.#container = this.#scene.add.container(0, 0);

        let background = this.#scene.add.image(0, -1, UI_ASSET_KEYS.BLANK).setOrigin(0).setTint(0x000000);
        background.displayWidth = this.#scene.game.canvas.width ;
        background.displayHeight = 120;
        this.#container.add(background);

        background = this.#scene.add.image(0, background.displayHeight, UI_ASSET_KEYS.BLANK).setOrigin(0);
        background.setTint(0xcccccc);
        background.displayWidth = this.#scene.game.canvas.width ;
        background.displayHeight = 4;
        this.#container.add(background);

        let txt = this.#scene.add.bitmapText(20, 20, UI_ASSET_KEYS.UNIT, "HP: ", 14).setTint(0xfff2e8).setOrigin(0, 0.5);
        this.#container.add(txt);
        this.#textHp = this.#scene.add.bitmapText(66, 20, UI_ASSET_KEYS.UNIT, "10", 14).setTint(0xfff2e8).setOrigin(0, 0.5);
        this.#container.add(this.#textHp);

        txt = this.#scene.add.bitmapText(20, 52, UI_ASSET_KEYS.UNIT, "Energy: ", 14).setTint(0xfff2e8).setOrigin(0, 0.5);
        this.#container.add(txt);
        this.#textEnergy = this.#scene.add.bitmapText(130, 52, UI_ASSET_KEYS.UNIT, "100", 14).setTint(0xfff2e8).setOrigin(0, 0.5);
        this.#container.add(this.#textEnergy);

        txt = this.#scene.add.bitmapText(20, 84, UI_ASSET_KEYS.UNIT, "Gold: ", 14).setTint(0xfff2e8).setOrigin(0, 0.5);
        this.#container.add(txt);
        this.#textGold = this.#scene.add.bitmapText(90, 84, UI_ASSET_KEYS.UNIT, "0", 14).setTint(0xfff2e8).setOrigin(0, 0.5);
        this.#container.add(this.#textGold);
    }

    /** @type {Phaser.GameObjects.Container} */
    get container() { return this.#container; }

    updateGold(amount) {
        this.#textGold.text = amount;
    }

    updateEnergy(amount) {
        this.#textEnergy.text = amount;
    }

    updateHp(amount) {
        this.#textHp.text = amount;
    }
}