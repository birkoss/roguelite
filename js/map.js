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
        this.enemies = [];
        this.actions = [];

        /* Generate all tiles */
        this.tiles = [];
        for (let y=0; y<this.config.height; y++) {
            for (let x=0; x<this.config.width; x++) {

                let tile = new Tile(this.scene);
                tile.gridX = x;
                tile.gridY = y;

                tile.x = tile.getBounds().width * x;
                tile.y = tile.getBounds().height * y;

                this.add(tile);
                this.tiles.push(tile);
            }
        }

        this.generateMap(10);
    }

    generateEnemies() {
        this.enemies.forEach(single_enemy => {
            single_enemy.destroy();
        });
        this.enemies = [];

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

            this.placeUnit(enemy, tile.gridX, tile.gridY);
            this.add(enemy);

            this.enemies.push(enemy);
        }
    }

    generateLevel() {
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

    generateMap(player_health) {
        this.turns = [];

        this.generateLevel();

        this.generateEnemies();

        if (this.player != undefined) {
            this.player.destroy();
        }

        let tile = this.pickEmptyTile();
        if (tile) {
            this.player = new Unit(this.scene, "knight", 10);
            if (player_health < this.player.health) {
                this.player.health = player_health;
                this.player.updateBar();
            }
            this.player.type = Unit.PLAYER;
            this.player.on("UNIT_MOVED", this.onUnitMoved, this);
            //this.player.attack = 10;
            this.placeUnit(this.player, tile.gridX, tile.gridY);
            //this.placeUnit(this.player, 0, 0);
            this.add(this.player);
        }
    }

    export() {
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

    /* Get all the adjacent tiles of (x, y) */
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

    /* Get all the connected tile from the tile at (x, y) */
    getConnectedTiles(x, y) {
        if (!this.isValidTile(x, y) || !this.isEmptyAt(x, y)) {
            return [];
        }
        return this.floodFill(x, y, this.getTileAt(x, y).type);
    }

    /* Calculate the distance between 2 units */
    getDistanceBetweenUnit(unit1, unit2) {
        let diff = Math.abs(unit1.gridX - unit2.gridX) + Math.abs(unit1.gridY - unit2.gridY);
        return diff;
    }

    /* Get all empty tiles (Not walls and without enemies) */
    getEmptyTiles() {
        return this.tiles.filter(single_tile => {
            return this.isEmptyAt(single_tile.gridX, single_tile.gridY);
        });
    }

    /* Get the tile at (x, y) */
    getTileAt(x, y) {
        if (!this.isValidTile(x, y)) {
            return null;
        }
        return this.tiles[ (y * this.config.width) + x];
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

    /* Is the tile at (x, y) empty: a floor without enemies */
    isEmptyAt(x, y) {
        if (!this.isValidTile(x, y)) {
            return false;
        }

        if (!this.isFloorAt(x, y)) {
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

    /* Is the tile at (x, y) is a floor and not a wall */
    isFloorAt(x, y) {
        if (!this.isValidTile(x, y)) {
            return false;
        }

        let tile = this.getTileAt(x, y);
        if (tile.type != Tile.FLOOR) {
            return false;
        }

        return true;
    }

    /* Is the tile at (x, y) is within bounds of the map */
    isValidTile(x, y) {
        let index = (y * this.config.width) + x;

        return x >= 0 && x < this.config.width && y >= 0 && y < this.config.height && this.tiles[index] != undefined;
    }

    /* Pick a random empty tiles (a floor without enemies) */
    pickEmptyTile() {
        let tiles = this.getEmptyTiles();
        return tiles[ Phaser.Math.Between(0, tiles.length-1) ];
    }



    /* Initiate an attack from ATTACKER to the DEFENDER and run a callback when it's done */
    attackUnit(attacker, defender, callback, scope) {
        // Save the original position (to get back there after the attack)
        let attacker_original_position = {
            x: attacker.x,
            y: attacker.y
        };

        // Face the right direction before attacking
        if (attacker.gridX < defender.gridX) {
            attacker.face(1);
        } else if (attacker.gridX > defender.gridX) {
            attacker.face(-1);
        }

        // Move to the defender's position
        this.scene.tweens.add({
            targets: attacker,
            x: defender.x,
            y: defender.y,
            ease: 'Cubic',
            duration: 150,
            onComplete: function() {
                // Start the ATTACK animation
                let effect = this.scene.add.sprite(defender.x + (defender.width * defender.scaleX) / 2, defender.y + (defender.height * defender.scaleY) / 2, "tileset:effectsLarge");
                this.add(effect);
                effect.on("animationcomplete", function(tween, sprite, element) {
                    element.destroy();
                    defender.damage(attacker.attack);
                    // Move the attacker's back to its orignal position
                    this.scene.tweens.add({
                        targets: attacker,
                        x: attacker_original_position.x,
                        y: attacker_original_position.y,
                        ease: 'Cubic',
                        duration: 150,
                        onCompleteScope: scope,
                        onComplete: callback
                    });
                }, this);
                effect.anims.play("attack", true);
            },
            onCompleteScope: this
        });
    }

    /* Change the position of an unit (without animation) */
    placeUnit(unit, gridX, gridY) {
        unit.gridX = gridX;
        unit.gridY = gridY;

        unit.x = (gridX * unit.getBounds().width) + (unit.getBounds().width / 2);
        unit.y = (gridY * unit.getBounds().height) + (unit.getBounds().height / 2);
    }

    showActions() {
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

        this.emit("PLAYER_TURN_START", this);
    }



    tick(single_enemy) {
        // Can it attack the player ?
        let diff = this.getDistanceBetweenUnit(this.player, single_enemy);

        if (diff == 1) {
            this.scene.cameras.main.shake(500);
            this.attackUnit(single_enemy, this.player, this.nextTurn, this);
        } else {
            let pf = new Pathfinding(this.generatePathfindingMap(), this.config.width, this.config.height);
            let tiles = pf.find({x: single_enemy.gridX, y: single_enemy.gridY}, {x: this.player.gridX, y: this.player.gridY});

            if (tiles.length > 1) {
                let neighboor = tiles[0];
                single_enemy.move(neighboor.x, neighboor.y);
            } else {
                this.nextTurn();
            }
        }
    }

    nextTurn() {
        this.emit("END_TURN");
    }

    /* Events */

    onUnitMoved(unit) {
        this.nextTurn();
    }

    onActionClicked(action) {
        this.emit("PLAYER_TURN_END", this);

        this.actions.forEach(single_action => {
            single_action.destroy();
        });

        switch (action.type) {
            case Action.MOVE:
                this.player.move(action.target.gridX, action.target.gridY);
                break;
            case Action.ATTACK:
                this.attackUnit(this.player, action.target, this.nextTurn, this);
                break;
            case Action.SPELL:
                switch (action.spell) {
                    case "WARP":
                        // Randomly warp the player
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

                                this.placeUnit(this.player, tile.gridX, tile.gridY);

                                this.nextTurn();

                            }, this);
                            effect.anims.play("warp", true);

                        }, this);

                        effect.anims.play("warp", true);
                        break;
                    case "QUAKE":
                        // Hit enemies depending on how much walls are around them
                        let duration = 500;

                        // Shake the camera
                        this.scene.cameras.main.shake(duration);

                        // Wait until the camera stopped shaking to resume the turn
                        this.scene.time.addEvent({
                            delay: duration,
                            callback: function() {
                                this.nextTurn();
                            },
                            callbackScope: this
                        });

                        // Hit each enemies depending on the walls surrounding them
                        this.enemies.forEach(single_enemy => {
                            if (single_enemy.isAlive()) {
                                let neighboors = this.getAdjacentTiles(single_enemy.gridX, single_enemy.gridY);
                                let damage = 4;
                                neighboors.forEach(single_neighboor => {
                                    if (this.isFloorAt(single_neighboor.x, single_neighboor.y)) {
                                        damage--;
                                    }
                                });

                                if (damage > 0) {
                                    single_enemy.damage(damage);
                                }
                            }
                        });
                        break;
                    case "MAELSTROM":
                        // Randomly move all enemies
                        this.enemies.forEach(single_enemy => {
                            let effect = this.scene.add.sprite(single_enemy.x + (single_enemy.width * single_enemy.scaleX) / 2, single_enemy.y + (single_enemy.height * single_enemy.scaleY) / 2, "tileset:effectsSmall");
                            this.add(effect);
                            single_enemy.is_moving = true;

                            effect.on("animationcomplete", function(tween, sprite, element) {
                                element.destroy();

                                let tile = this.pickEmptyTile();

                                let effect = this.scene.add.sprite(tile.x, tile.y, "tileset:effectsSmall");
                                effect.x += (effect.width/2);
                                effect.y += (effect.height/2);
                                this.add(effect);
                                effect.on("animationcomplete", function(tween, sprite, element) {
                                    element.destroy();

                                    this.placeUnit(single_enemy, tile.gridX, tile.gridY);

                                    single_enemy.is_moving = false;
                                    let remaining_animations = this.enemies.filter(single_enemy => single_enemy.is_moving);
                                    if (remaining_animations.length == 0) {
                                        this.nextTurn();
                                    }

                                }, this);
                                effect.anims.play("warp", true);

                            }, this);

                            effect.anims.play("warp", true);
                        });
                        break;
                    case "MULLIGAN":
                        // Reset the map, and reduce the player health by 50% (min at 1)
                        let player_health = Math.max(1, Math.floor(this.player.health / 2));
                        this.generateMap(player_health);

                        /* Since the player will always be first, remove the first turn to allow the enemy to have the next move */
                        this.generateTurns();
                        this.turns.shift();

                        this.nextTurn();
                        break;
                    case "AURA":
                        // Heal the player and any adjacent enemies
                        let neighboors = this.getAdjacentTiles(this.player.gridX, this.player.gridY);
                        neighboors.forEach(single_neighboor => {
                            let enemy_around = null;

                            this.enemies.forEach(single_enemy => {
                                if (single_enemy.gridX == single_neighboor.x && single_enemy.gridY == single_neighboor.y) {
                                    enemy_around = single_enemy;
                                }
                            });

                            if (enemy_around != null) {
                                let effect2 = this.scene.add.sprite(enemy_around.x + (enemy_around.width * enemy_around.scaleX) / 2, enemy_around.y + (enemy_around.height * enemy_around.scaleY) / 2, "tileset:effectsSmall");
                                this.add(effect2);
                                effect2.on("animationcomplete", function(tween, sprite, element) {
                                    element.destroy();

                                    enemy_around.heal(1);
                                });
                                effect2.anims.play("heal", true);
                            }
                        });

                        let effect2 = this.scene.add.sprite(this.player.x + (this.player.width * this.player.scaleX) / 2, this.player.y + (this.player.height * this.player.scaleY) / 2, "tileset:effectsSmall");
                        this.add(effect2);

                        effect2.on("animationcomplete", function(tween, sprite, element) {
                            element.destroy();

                            this.player.heal(1);
                            this.nextTurn();

                        }, this);

                        effect2.anims.play("heal", true);
                        break;
                }
                break;
        }
    }

    onEnemyAction(unit) {
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