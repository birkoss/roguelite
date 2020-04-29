class Unit extends Phaser.GameObjects.Container {

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

        this.createBar();

    }

    createBar() {
        let border = this.scene.add.sprite(0, 0, "blank");
        border.setOrigin(0);
        border.setTint(0x000000);
        border.displayWidth = 34;
        border.displayHeight = 8;
        border.x -= parseInt(border.displayWidth/2);
        border.y = this.background.height - border.displayHeight;
        this.add(border);

        let background = this.scene.add.sprite(0, 0, "blank");
        background.setOrigin(0);
        background.setTint(0xff0000);
        background.displayWidth = 30;
        background.displayHeight = 4;
        background.x = border.x + 2;
        background.y = border.y + 2;
        this.add(background);

        this.status = this.scene.add.sprite(0, 0, "blank");
        this.status.setOrigin(0);
        this.status.setTint(0x00ff00);
        this.status.displayWidth = 30;
        this.status.displayHeight = 4;
        this.status.x = border.x + 2;
        this.status.y = border.y + 2;
        this.add(this.status);

        this.status.displayWidth = 15;
    }

    revive() {
        this.health = this.maxHealth;
        this.emit("UNIT_REVIVED", this);
    }

    damage(amount) {
        this.health = Math.max(0, this.health - amount);

        this.status.displayWidth = (30 * this.health / this.maxHealth);
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
        this.background.scaleX = (this.direction == -1 ? 1 : -1) * this.pixelScale;
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


Unit.PLAYER = 1;
Unit.ENEMY = 2;