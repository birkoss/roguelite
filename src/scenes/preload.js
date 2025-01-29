import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { FONT_ASSET_KEYS, PANEL_ASSET_KEYS, BLOCK_ASSET_KEYS, UNIT_ASSET_KEYS } from "../keys/asset.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    preload() {
        // TODO: Resize and unscale
        this.load.spritesheet(BLOCK_ASSET_KEYS.BACKGROUND, 'assets/tilesets/block/background.png', {
            frameWidth: 44,
            frameHeight: 44,
        });
        // TODO: Resize and unscale and uncolor
        this.load.spritesheet(BLOCK_ASSET_KEYS.ICON, 'assets/tilesets/block/icon.png', {
            frameWidth: 28,
            frameHeight: 28,
        });
        this.load.spritesheet(UNIT_ASSET_KEYS.BACKGROUND, 'assets/tilesets/unit/background.png', {
            frameWidth: 48,
            frameHeight: 72,
        });
        this.load.spritesheet(PANEL_ASSET_KEYS.ICON, 'assets/tilesets/panel/icon.png', {
            frameWidth: 16,
            frameHeight: 20,
        });
        
        // TODO: Resize and unscale
        this.load.image(PANEL_ASSET_KEYS.BACKGROUND, 'assets/tilesets/panel/background.png');
        
        this.load.bitmapFont(PANEL_ASSET_KEYS.FONT, 'assets/fonts/panel/font.png', 'assets/fonts/panel/font.xml');
        this.load.bitmapFont(FONT_ASSET_KEYS.POINT, 'assets/fonts/point/font.png', 'assets/fonts/point/font.xml');
    }

    create() {
        this.scene.start(SCENE_KEYS.DUNGEON_SCENE);
    }
}
