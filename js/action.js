class Action extends Phaser.GameObjects.Container {

    static MOVE = 1;
    static ATTACK = 2;
    static SPELL = 3;

    constructor(scene, type) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.type = type;

        this.create();
    }

    create() {
        this.background = this.scene.add.sprite(0, 0, "tileset:actions", 3);
        this.add(this.background);

        this.background.setInteractive();
        this.background.on("pointerdown", this.onPointerDown, this);

        if (this.type == Action.ATTACK) {
            this.background.setFrame(0);
        }
    }

    onPointerDown() {
        this.emit("ACTION_CLICKED", this);
    }
};