class BootScene extends Phaser.Scene {
    constructor() {
        super({
            key:'BootScene'
        });
    }
 
    preload() {
        this.load.spritesheet('ui:long_buttons', 'assets/sprites/long_buttons.png', { frameWidth: 190, frameHeight: 49 });

        this.load.spritesheet('tileset:world', 'assets/sprites/world.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('tileset:units', 'assets/sprites/units.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('tileset:items', 'assets/sprites/items.png', { frameWidth: 32, frameHeight: 32 });

        this.load.bitmapFont('font:guiOutline', 'assets/fonts/guiOutline.png', 'assets/fonts/guiOutline.xml');
        this.load.bitmapFont('font:gui', 'assets/fonts/gui.png', 'assets/fonts/gui.xml');

        this.load.spritesheet('tileset:effectsLarge', 'assets/sprites/effectsLarge.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('tileset:effectsSmall', 'assets/sprites/effectsSmall.png', { frameWidth: 48, frameHeight: 48 });

        this.load.json('data:units', 'assets/units.json');
    }
 
    create() {
        this.scene.start('MainScene');
    }
};