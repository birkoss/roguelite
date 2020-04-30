class Item extends Phaser.GameObjects.Container {

    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.create();
    }

    create() {
        this.background = this.scene.add.sprite(0, 0, "tileset:items", 2);
        this.background.setOrigin(0);
        this.add(this.background);
    }
};