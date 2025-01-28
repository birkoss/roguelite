import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { TILE_ASSET_KEYS, UI_ASSET_KEYS, UNIT_ASSET_KEYS } from "../keys/asset.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    preload() {
        this.load.spritesheet(TILE_ASSET_KEYS.TILE, 'assets/tilesets/tile.png', {
            frameWidth: 44,
            frameHeight: 44,
        });
        this.load.spritesheet(TILE_ASSET_KEYS.ICON, 'assets/tilesets/icon.png', {
            frameWidth: 28,
            frameHeight: 28,
        });
        this.load.spritesheet(UNIT_ASSET_KEYS.AVATAR, 'assets/tilesets/avatar.png', {
            frameWidth: 72,
            frameHeight: 72,
        });
        this.load.bitmapFont(UI_ASSET_KEYS.SMALL_FONT, 'assets/fonts/small-font.png', 'assets/fonts/small-font.xml');
        this.load.bitmapFont(UI_ASSET_KEYS.LARGE_FONT, 'assets/fonts/Unnamed.png', 'assets/fonts/Unnamed.xml');
        this.load.bitmapFont(UI_ASSET_KEYS.POINT, 'assets/fonts/point.png', 'assets/fonts/point.xml');
        // this.load.bitmapFont(UI_ASSET_KEYS.LARGE_FONT, 'assets/fonts/large-font.png', 'assets/fonts/large-font.xml');
    }

    create() {
        this.scene.start(SCENE_KEYS.DUNGEON_SCENE);
    }
}
