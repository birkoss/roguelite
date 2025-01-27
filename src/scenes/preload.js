import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { TILE_ASSET_KEYS } from "../keys/asset.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    preload() {
        this.load.spritesheet(TILE_ASSET_KEYS.TILE, 'assets/tilesets/tile.png', {
            frameWidth: 40,
            frameHeight: 40,
        });
        this.load.spritesheet(TILE_ASSET_KEYS.ICON, 'assets/tilesets/icon.png', {
            frameWidth: 28,
            frameHeight: 28,
        });
    }

    create() {
        this.scene.start(SCENE_KEYS.DUNGEON_SCENE);
    }
}
