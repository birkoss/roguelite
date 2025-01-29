import { DUNGEON_ASSET_KEYS, UI_ASSET_KEYS, UNIT_ASSET_KEYS } from "./keys/asset.js";

export class Panel {
    /** @type {Phaser.Scene} */
    #scene;
    #container;

    #textHealth;
    #textCoin;
    #textMana;
    #textEnemy;

    /**
     * @param {number} x - The x coordinate of the tile on the grid
     * @param {number} y - The y coordinate of the tile on the grid
     */
    constructor(scene, x, y) {
        this.#scene = scene;

        this.#container = scene.add.container(x, y);

        let background = scene.add.rectangle(0, 0, this.#scene.game.canvas.width, 168, 0x333333).setOrigin(0, 0);
        this.#container.add(background);

        let line = scene.add.rectangle(0, background.y + background.height, this.#scene.game.canvas.width, 2, 0x646464).setOrigin(0, 0);
        this.#container.add(line);

        let shadow = scene.add.rectangle(0, line.y + line.height, this.#scene.game.canvas.width, 16, 0x000000, 0.2).setOrigin(0, 0);
        this.#container.add(shadow);

        // this.#textCoin = scene.add.bitmapText(100, 25, UI_ASSET_KEYS.LARGE_FONT, 'COIN:10', 21).setTint(0x646464).setOrigin(0);
        // this.#container.add(this.#textCoin);
        // this.#textMana = scene.add.bitmapText(100, 47, UI_ASSET_KEYS.LARGE_FONT, 'MANA:10', 21).setTint(0x646464).setOrigin(0);
        // this.#container.add(this.#textMana);

        // let avatar = scene.add.sprite(10, 10, UNIT_ASSET_KEYS.AVATAR).setOrigin(0).setAlpha(0.7);
        // this.#container.add(avatar);

        // this.#textHealth = scene.add.bitmapText(avatar.x + avatar.width/2, avatar.y + avatar.height, UI_ASSET_KEYS.LARGE_FONT, "HP\n10", 21).setTint(0x646464).setOrigin(0.5, 0);
        // this.#container.add(this.#textHealth);

        // avatar = scene.add.sprite(0, 10, UNIT_ASSET_KEYS.AVATAR, 1).setOrigin(1, 0).setAlpha(0.7);
        // avatar.x = this.#scene.game.canvas.width - 10;
        // this.#container.add(avatar);

        // this.#textEnemy = scene.add.bitmapText(0, avatar.y + avatar.height, UI_ASSET_KEYS.LARGE_FONT, "HP\n20", 21).setTint(0x646464).setOrigin(0.5, 0);
        // this.#textEnemy.x = this.#scene.game.canvas.width - 5 - avatar.width / 2;
        // this.#container.add(this.#textEnemy);

        


        let bg = scene.add.sprite(0, 24, DUNGEON_ASSET_KEYS.BACKGROUND).setOrigin(0).setTint(0x595d8c);
        this.#container.add(bg);

        let playerShadow = scene.add.sprite(165, bg.y + bg.height - 20, UNIT_ASSET_KEYS.UNIT, 0).setOrigin(0.5).setTint(0x000000);
        playerShadow.scaleX = -1;
        this.#container.add(playerShadow);

        let player = scene.add.sprite(163, bg.y + bg.height - 20, UNIT_ASSET_KEYS.UNIT, 0).setOrigin(0.5).setTint(0x08bafc);
        player.scaleX = -1;
        this.#container.add(player);

        playerShadow = scene.add.sprite(252, bg.y + bg.height - 20, UNIT_ASSET_KEYS.UNIT, 195).setOrigin(0.5).setTint(0x000000);
        this.#container.add(playerShadow);

        player = scene.add.sprite(250, bg.y + bg.height - 20, UNIT_ASSET_KEYS.UNIT, 195).setOrigin(0.5).setTint(0x4db02f);
        this.#container.add(player);
        
        background = scene.add.rectangle(0, 0, this.#scene.game.canvas.width, 24, 0x000000).setOrigin(0, 0);
        this.#container.add(background);

        background = scene.add.rectangle(0, 4, this.#scene.game.canvas.width, 16, 0x9e2b18).setOrigin(0, 0);
        this.#container.add(background);

        this.#textEnemy = scene.add.bitmapText(0, 1, UI_ASSET_KEYS.SMALL_FONT, "Goblin", 20).setTint(0xffffff).setOrigin(1, 0);
        this.#textEnemy.x = this.#scene.game.canvas.width - 5;
        this.#container.add(this.#textEnemy);

        background = scene.add.rectangle(0, bg.y + bg.height + 10, this.#scene.game.canvas.width, 24, 0x000000).setOrigin(0, 0);
        this.#container.add(background);

        background = scene.add.rectangle(0, bg.y + bg.height + 14, this.#scene.game.canvas.width, 16, 0x139c13).setOrigin(0, 0);
        this.#container.add(background);

        this.#textEnemy = scene.add.bitmapText(5, bg.y + bg.height + 11, UI_ASSET_KEYS.SMALL_FONT, "Your Knight", 20).setTint(0xffffff).setOrigin(0, 0);
        this.#container.add(this.#textEnemy);

        // player
        background = scene.add.rectangle(0, 24, 40, 120, 0x000000).setOrigin(0, 0).setAlpha(0.3);
        this.#container.add(background);

        player = scene.add.sprite(5, 26, UI_ASSET_KEYS.PANEL, 0).setOrigin(0).setTint(0xd40200).setScale(2);
        this.#container.add(player);
        this.#textEnemy = scene.add.bitmapText(45, 29, UI_ASSET_KEYS.SMALL_FONT, "10/10", 30).setTint(0xffffff).setOrigin(0).setAlpha(0.8);;
        this.#container.add(this.#textEnemy);

        player = scene.add.sprite(5, 64, UI_ASSET_KEYS.PANEL, 1).setOrigin(0).setTint(0x5487ff).setScale(2);
        this.#container.add(player);
        this.#textEnemy = scene.add.bitmapText(45, 68, UI_ASSET_KEYS.SMALL_FONT, "10/99", 30).setTint(0xffffff).setOrigin(0).setAlpha(0.8);;
        this.#container.add(this.#textEnemy);
        
        player = scene.add.sprite(5, 106, UI_ASSET_KEYS.PANEL, 2).setOrigin(0).setTint(0x8c7533).setScale(2);
        this.#container.add(player);

        this.#textEnemy = scene.add.bitmapText(45, 108, UI_ASSET_KEYS.SMALL_FONT, "230", 30).setTint(0xffffff).setOrigin(0).setAlpha(0.8);;
        this.#container.add(this.#textEnemy);

        background = scene.add.rectangle(0, 24, 40, 120, 0x000000).setOrigin(1, 0).setAlpha(0.3);
        background.x = this.#scene.game.canvas.width;
        this.#container.add(background);

        player = scene.add.sprite(5, 26, UI_ASSET_KEYS.PANEL, 0).setOrigin(1, 0).setTint(0xd40200).setScale(2);
        player.x = this.#scene.game.canvas.width - 4;
        this.#container.add(player);
        this.#textEnemy = scene.add.bitmapText(45, 29, UI_ASSET_KEYS.SMALL_FONT, "10/10", 30).setTint(0xffffff).setOrigin(1, 0).setAlpha(0.8);;
        this.#textEnemy.x = this.#scene.game.canvas.width - 45;
        this.#container.add(this.#textEnemy);

        player = scene.add.sprite(5, 64, UI_ASSET_KEYS.PANEL, 1).setOrigin(1, 0).setTint(0x5487ff).setScale(2);
        player.x = this.#scene.game.canvas.width - 4;
        this.#container.add(player);
        this.#textEnemy = scene.add.bitmapText(45, 68, UI_ASSET_KEYS.SMALL_FONT, "10/99", 30).setTint(0xffffff).setOrigin(1, 0).setAlpha(0.8);
        this.#textEnemy.x = this.#scene.game.canvas.width - 45;
        this.#container.add(this.#textEnemy);

    }
}
