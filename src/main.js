import Phaser from './lib/phaser.js';

import { PreloadScene } from './scenes/preload.js';
import { DungeonScene } from './scenes/dungeon.js';
import { SCENE_KEYS } from './keys/scene.js';

const game = new Phaser.Game({
    type: Phaser.AUTO,
    pixelArt: true,
    roundPixels: true,
    scale: {
        parent: 'game-container',
        width: window.innerWidth,
        height: window.innerHeight,
    },
    backgroundColor: '#333333',
  
});

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.DUNGEON_SCENE, DungeonScene);

game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
