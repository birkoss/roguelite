class Tile extends Phaser.GameObjects.Container {

    static WALL = 1;

    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.create();
    }

    create() {
        this.background = this.scene.add.sprite(0, 0, "tileset:world", 0);
        this.background.setOrigin(0);
        this.add(this.background);
    }

    setType(type) {
        this.type = type;
        
        switch (type) {
            case Tile.WALL:
                this.background.setFrame(0);
                break;
            case Tile.FLOOR:
                this.background.setFrame(3);
                break;
        }
    }
};