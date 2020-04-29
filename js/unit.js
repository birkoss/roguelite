class Unit extends Phaser.GameObjects.Container {

    static PLAYER = 1;
    static ENEMY = 2;

    constructor(scene, unitId, health) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.maxHealth = this.health = health;
        this.attack = 1;

        this.pixelScale = 2;
        this.unitId = unitId;

        this.type = Unit.ENEMY;

        this.create();
    }

    create() {
        this.unitData = {};

        let unitsData = this.scene.cache.json.get('data:units');
        unitsData.forEach(single_data => {
            if (single_data.id == this.unitId) {
                this.unitData = single_data;
            }
        }, this);


        this.background = this.scene.add.sprite(0, 0, "tileset:units", this.unitData.frames[0]);
        this.background.setScale(this.pixelScale);
        this.add(this.background);

        this.background.setInteractive();
        this.background.on("pointerdown", this.onPointerDown, this);

        this.direction = -1;

        this.is_moving = false;
    }

    revive() {
        this.health = this.maxHealth;
        this.emit("UNIT_REVIVED", this);
    }

    damage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (!this.isAlive()) {
            this.background.setTexture("tileset:effectsSmall");
            this.background.setScale(1);
            this.background.setFrame(98);
            this.emit("UNIT_KILLED", this);
        }
    }

    isAlive() {
        return this.health > 0;
    }

    animate() {
        this.background.anims.play(this.unitId);
    }

    move(gridX, gridY) {
        if (gridX < this.gridX) {
            this.face(-1);
        } else if (gridX > this.gridX) {
            this.face(1);
        }

        this.gridX = gridX;
        this.gridY = gridY;
        
        this.is_moving = true;

        this.scene.tweens.add({
            targets: this,
            x: (gridX * (this.background.width * this.pixelScale)) + (this.getBounds().width / 2),
            y: (gridY * (this.background.height * this.pixelScale)) + (this.getBounds().height / 2),
            ease: 'Cubic',
            duration: 300,
            onComplete: this.onUnitMoved,
            onCompleteScope: this
        });
    }

    face(newDirection) {
        if (newDirection == this.direction) {
            return;
        }

        this.direction = newDirection;
        this.scaleX = (this.direction == -1 ? 1 : -1);
    }

    deactivate() {
        this.background.anims.stop();
    }

    isMoving() {
        return this.is_moving;
    }

    onPointerDown() {
        this.emit("UNIT_CLICKED", this);
    }

    onUnitMoved() {
        this.is_moving = false;
        this.emit("UNIT_MOVED", this);
    }
};