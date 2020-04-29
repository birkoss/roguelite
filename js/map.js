class Map extends Phaser.GameObjects.Container {

    constructor(scene, width, height) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.config = {
            'width': width,
            'height': height
        };
        this.create();
    }

    create() {
        this.turns = [];

        this.scene.anims.create({
            key: "attack",
            frames: [{
                frame: 10,
                key: "tileset:effectsLarge"
            },{
                frame: 11,
                key: "tileset:effectsLarge"
            }],
            frameRate: 30,
            yoyo: true,
            repeat: 2
        });

        this.scene.anims.create({
            key: "warp",
            frames: [{
                frame: 5,
                key: "tileset:effectsSmall"
            },{
                frame: 6,
                key: "tileset:effectsSmall"
            },{
                frame: 7,
                key: "tileset:effectsSmall"
            },{
                frame: 8,
                key: "tileset:effectsSmall"
            },{
                frame: 9,
                key: "tileset:effectsSmall"
            }],
            frameRate: 20,
            yoyo: true,
            repeat: 1
        });

        this.enemies = [];
        this.actions = [];

        this.generateLevel();

        this.generateEnemies();

        let tile = this.pickEmptyTile();
        if (tile) {
            this.player = new Unit(this.scene, "knight", 10);
            this.player.type = Unit.PLAYER;
            this.player.on("UNIT_MOVED", this.onUnitMoved, this);
            //this.player.attack = 10;
            this.moveUnit(this.player, tile.gridX, tile.gridY);
            //this.moveUnit(this.player, 0, 0);
            this.add(this.player);
        }

        this.nextTurn();
    }


    generateTurns() {
        console.log("generateTurns");
        this.turns.push(this.player);

        this.enemies.forEach(single_enemy => {
            if (single_enemy.isAlive()) {
                this.turns.push(single_enemy);
            }
        });
    }

    nextTurn() {
        console.log("nextTurn...");
        if (this.turns.length == 0) {
            this.generateTurns();
        }

        let unit = this.turns.shift();
        if (unit.isAlive()) {
            this.bringToTop(unit);

            if (unit.type == Unit.PLAYER) {
                this.waitForAction();
            } else {
                this.tick(unit);
            }
        } else {
            this.nextTurn();
        }
    }

    generateLevel() {
        this.tiles = [];

        /* Generate all tiles */
        for (let y=0; y<this.config.height; y++) {
            for (let x=0; x<this.config.width; x++) {

                let tile;
                try {

                    tile = new Tile(this.scene);
                } catch(err) {
                    alert("Err:");
                    alert(err);
                }
                tile.gridX = x;
                tile.gridY = y;

                tile.x = tile.getBounds().width * x;
                tile.y = tile.getBounds().height * y;

                this.add(tile);
                this.tiles.push(tile);
            }
        }

        let generatingMap = true;
        /* Generate the walls and floors */
        do {
            console.log("Generating walls and floors...");
            this.tiles.forEach(single_tile => {
                if (single_tile.gridX == 0 || single_tile.gridY == 0 || single_tile.gridX == this.config.width-1 || single_tile.gridY == this.config.height-1) {
                    single_tile.setType(Tile.WALL);
                } else {
                    if (Phaser.Math.Between(1, 10) <= 3) {
                        single_tile.setType(Tile.WALL);
                    } else {
                        single_tile.setType(Tile.FLOOR);
                    }
                }
            });

            let emptyTiles = this.getEmptyTiles();
            let connectedTiles = this.getConnectedTiles(emptyTiles[0].gridX, emptyTiles[0].gridY);

            if (emptyTiles.length == connectedTiles.length) {
                generatingMap = false;
            }
        } while (generatingMap);
    }

    generateEnemies() {
        /*
        Bird: our basic monster with no special behavior
Snake: moves twice (yes, basically copied from 868-HACK's Virus)
Tank: moves every other turn
Eater: destroys walls and heals by doing so
Jester: moves randomly

*/
        for (let i=0; i<2; i++) {
            let tile = this.pickEmptyTile();

            let enemy = new Unit(this.scene, "skeleton", 5);
            enemy.on("UNIT_MOVED", this.onEnemyAction, this);

            this.moveUnit(enemy, tile.gridX, tile.gridY);
            this.add(enemy);

            this.enemies.push(enemy);
        }
    }

    generateMap() {
        let map = [];

        this.tiles.forEach(single_tile => {
            let tile_value = 1;
            if (single_tile.type == Tile.FLOOR) {
                // Check for enemy position
                if (this.isEmptyAt(single_tile.gridX, single_tile.gridY)) {
                    tile_value = 0;
                }
            }

            map.push(tile_value);
        });

        return map;
    }

    getConnectedTiles(x, y) {
        if (!this.isValidTile(x, y) || !this.isEmptyAt(x, y)) {
            return [];
        }

        return this.floodFill(x, y, this.getTileAt(x, y).type);
    }

    getTileAt(x, y) {
        if (!this.isValidTile(x, y)) {
            return null;
        }
        return this.tiles[ (y * this.config.width) + x];
    }

    getAdjacentTiles(x, y) {
        let tiles = [];

        for (let y2=-1; y2<=1; y2++) {
            for (let x2=-1; x2<=1; x2++) {
                if (Math.abs(x2) != Math.abs(y2)) {
                    tiles.push({
                        x: x + x2,
                        y: y + y2
                    });
                }
            }
        }

        return tiles;
    }

    floodFill(x, y, type, tiles) {
        if (tiles == undefined) {
            tiles = [];
        }

        /* Do not add invalid of empty tiles */
        if (!this.isValidTile(x, y) || !this.isEmptyAt(x, y)) {
            return tiles;
        }

        /* Only add tiles of the same type */
        if (this.getTileAt(x, y).type != type) {
            return tiles;
        }

        /* Only add unvisited tiles */
        if (tiles.filter(single_tile => single_tile.x == x && single_tile.y == y).length > 0) {
            return tiles
        }

        /* Add this tile to our list */
        tiles.push({
            x: x,
            y: y
        });

        /* Recursively flood fill adjacent neighboors */
        let neighboors = this.getAdjacentTiles(x, y);
        neighboors.forEach(single_neighboor => {
            this.floodFill(single_neighboor.x, single_neighboor.y, type, tiles);
        });

        return tiles;
    }

    isValidTile(x, y) {
        let index = (y * this.config.width) + x;

        return x >= 0 && x < this.config.width && y >= 0 && y < this.config.height && this.tiles[index] != undefined;
    }

    isEmptyAt(x, y) {
        if (!this.isValidTile(x, y)) {
            return false;
        }

        let tile = this.getTileAt(x, y);
        if (tile.type != Tile.FLOOR) {
            return false;
        }

        let hasEnemy = false;
        this.enemies.forEach(single_enemy => {
            if (single_enemy.isAlive() && single_enemy.gridX == x && single_enemy.gridY == y) {
                hasEnemy = true;
            }
        });
        if (hasEnemy) {
            return false;
        }

        return true;
    }

    attackUnit(attacker, defender, callback) {
        let attacker_position = {
            x: attacker.x,
            y: attacker.y
        };

        if (attacker.gridX < defender.gridX) {
            attacker.face(1);
        } else if (attacker.gridX > defender.gridX) {
            attacker.face(-1);
        }

        this.scene.tweens.add({
            targets: attacker,
            x: defender.x,
            y: defender.y,
            ease: 'Cubic',
            duration: 150,
            onComplete: function() {

                let effect = this.scene.add.sprite(defender.x + (defender.width * defender.scaleX) / 2, defender.y + (defender.height * defender.scaleY) / 2, "tileset:effectsLarge");
                this.add(effect);

                effect.on("animationcomplete", function(tween, sprite, element) {
                    element.destroy();

                    defender.damage(attacker.attack);

                    this.scene.tweens.add({
                        targets: attacker,
                        x: attacker_position.x,
                        y: attacker_position.y,
                        ease: 'Cubic',
                        duration: 150,
                        onCompleteScope: this,
                        onComplete: callback
                    });

                }, this);

                effect.anims.play("attack", true);
            },
            onCompleteScope: this
        });
    }

    moveUnit(unit, gridX, gridY) {
        unit.gridX = gridX;
        unit.gridY = gridY;

        unit.x = (gridX * unit.getBounds().width) + (unit.getBounds().width / 2);
        unit.y = (gridY * unit.getBounds().height) + (unit.getBounds().height / 2);
    }

    getEmptyTiles() {
        // @TODO
        return this.tiles.filter(single_tile => single_tile.type == Tile.FLOOR);
    }

    pickEmptyTile() {
        let tiles = this.getEmptyTiles();
        return tiles[ Phaser.Math.Between(0, tiles.length-1) ];
    }

    waitForAction() {
        // Enable move actions
        let neighboors = this.getAdjacentTiles(this.player.gridX, this.player.gridY);
        neighboors.forEach(single_neighboor => {
            if (!this.isValidTile(single_neighboor.x, single_neighboor.y) || !this.isEmptyAt(single_neighboor.x, single_neighboor.y)) {
                return;
            }

            let action = new Action(this.scene, Action.MOVE);

            action.target = this.getTileAt(single_neighboor.x, single_neighboor.y);
            action.x = (single_neighboor.x * this.player.getBounds().width) + this.player.getBounds().width/2;
            action.y = (single_neighboor.y * this.player.getBounds().height) + this.player.getBounds().height/2;
            action.on("ACTION_CLICKED", this.onActionClicked, this);

            action.background.setFrame(0);

            if (single_neighboor.x < this.player.gridX) {
                action.background.setFrame(4);
            } else if (single_neighboor.x > this.player.gridX) {
                action.background.setFrame(2);
            } else if (single_neighboor.y < this.player.gridY) {
                action.background.setFrame(1);
            } else if (single_neighboor.y > this.player.gridY) {
                action.background.setFrame(3);
            }

            this.scene.tweens.add({
                targets: action,
                scaleX: 0.5,
                scaleY: 0.5,
                ease: 'Cubic',
                duration: 300,
                yoyo: true,
                repeat: -1
            });

            this.add(action);
            this.actions.push(action); 
        });

        // Enable attack actions
        this.enemies.forEach(single_enemy => {
            if (!single_enemy.isAlive()) {
                return;
            }
            let diff = this.getDistanceBetweenUnit(this.player, single_enemy);
            
            if (diff == 1) {
                let action = new Action(this.scene, Action.ATTACK);

                action.target = single_enemy;
                action.x = (single_enemy.gridX * this.player.getBounds().width) + this.player.getBounds().width/2;
                action.y = (single_enemy.gridY * this.player.getBounds().height) + this.player.getBounds().height/2;
                action.on("ACTION_CLICKED", this.onActionClicked, this);

                this.scene.tweens.add({
                    targets: action,
                    scaleX: 0.5,
                    scaleY: 0.5,
                    ease: 'Cubic',
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });

                this.add(action);
                this.actions.push(action); 
            }
        });
    }

    getDistanceBetweenUnit(unit1, unit2) {
        let diff = Math.abs(unit1.gridX - unit2.gridX) + Math.abs(unit1.gridY - unit2.gridY);

        return diff;
    }

    tick(single_enemy) {
        // Can it attack the player ?
        let diff = this.getDistanceBetweenUnit(this.player, single_enemy);

        if (diff == 1) {
            this.scene.cameras.main.shake(500);
            this.attackUnit(single_enemy, this.player, this.nextTurn);
        } else {
            let pf = new Pathfinding(this.generateMap(), this.config.width, this.config.height);
            let tiles = pf.find({x: single_enemy.gridX, y: single_enemy.gridY}, {x: this.player.gridX, y: this.player.gridY});

            if (tiles.length > 1) {
                let neighboor = tiles[0];
                single_enemy.move(neighboor.x, neighboor.y);
            } else {
                this.nextTurn();
            }
        }
    }

    /* Events */

    onUnitMoved(unit) {
        this.nextTurn();
    }

    onActionClicked(action) {
        this.actions.forEach(single_action => {
            single_action.destroy();
        });

        switch (action.type) {
            case Action.MOVE:
                this.player.move(action.target.gridX, action.target.gridY);
                break;
            case Action.ATTACK:
                this.attackUnit(this.player, action.target, this.nextTurn);
                break;
            case Action.SPELL:
                switch (action.spell) {
                    case "WARP":

                        let effect = this.scene.add.sprite(this.player.x + (this.player.width * this.player.scaleX) / 2, this.player.y + (this.player.height * this.player.scaleY) / 2, "tileset:effectsSmall");
                        this.add(effect);

                        effect.on("animationcomplete", function(tween, sprite, element) {
                            element.destroy();

                            let tile = this.pickEmptyTile();

                            let effect = this.scene.add.sprite(tile.x, tile.y, "tileset:effectsSmall");
                            effect.x += (effect.width/2);
                            effect.y += (effect.height/2);
                            this.add(effect);
                            effect.on("animationcomplete", function(tween, sprite, element) {
                                element.destroy();

                                this.moveUnit(this.player, tile.gridX, tile.gridY);

                                this.nextTurn();

                            }, this);
                            effect.anims.play("warp", true);

                        }, this);

                        effect.anims.play("warp", true);
                        break;
                }
                break;
        }
    }

    onEnemyAction(unit) {
        console.log("onEnemyAction");

        let completed = true;
        this.enemies.forEach(single_enemy => {
            if (single_enemy.isMoving()) {
                completed = false;
            }
        });

        if (completed) {
            this.nextTurn();
        }
    }

};