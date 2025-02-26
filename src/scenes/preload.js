import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { DATA_ASSET_KEYS, DUNGEON_ASSET_KEYS, UI_ASSET_KEYS, UNIT_ASSET_KEYS } from "../keys/asset.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    /**
     * Preloads all necessary assets for the game.
     */
    preload() {
        this.load.spritesheet(DUNGEON_ASSET_KEYS.DUNGEON, 'assets/tilesets/dungeon.png', {
            frameWidth: 36,
            frameHeight: 36,
        });
        this.load.spritesheet(UNIT_ASSET_KEYS.UNIT, 'assets/tilesets/unit.png', {
            frameWidth: 36,
            frameHeight: 36,
        });

        this.load.json(
            DATA_ASSET_KEYS.UNIT,
            'assets/data/unit.json'
        );

        this.load.bitmapFont(UI_ASSET_KEYS.SMALL_FONT, 'assets/fonts/small-font.png', 'assets/fonts/small-font.xml');
        this.load.bitmapFont(UI_ASSET_KEYS.LARGE_FONT, 'assets/fonts/large-font.png', 'assets/fonts/large-font.xml');
    }

    create() {
        this.scene.start(SCENE_KEYS.DUNGEON_SCENE);
    }
}
