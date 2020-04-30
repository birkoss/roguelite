class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MainScene'
        });
    }

    init(config) {
        this.levelConfig = config;
    }

    create() {
        this.map = new Map(this, 7, 10);
        this.map.on("END_TURN", this.nextTurn, this);
        this.map.on("ACTION_CLICKED", this.onMapActionClicked, this);

        this.map.generateMap({
            player_health: 10
        });

        this.map.x = (this.game.config.width - this.map.getBounds().width) / 2;
        this.map.y = this.map.x;

        this.buttons = [];

        this.spells = ['WARP','QUAKE','MAELSTROM','MULLIGAN'];

        let x = 50;

        this.spells.forEach(single_spell => {
            let btn = new SpellButton(this);
            btn.on("BUTTON_CLICKED", this.onSpellBtnClicked, this);
            btn.x = x;
            btn.y = 600;
            btn.spell = single_spell;
            this.add.existing(btn);
            this.buttons.push(btn);

            x += btn.getBounds().width + 10;
        });

        this.anims.create({
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

        this.anims.create({
            key: "heal",
            frames: [{
                frame: 26,
                key: "tileset:effectsSmall"
            },{
                frame: 27,
                key: "tileset:effectsSmall"
            },{
                frame: 28,
                key: "tileset:effectsSmall"
            },{
                frame: 29,
                key: "tileset:effectsSmall"
            }],
            frameRate: 20,
            yoyo: true,
            repeat: 1
        });

        this.anims.create({
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

        this.turns = [];
        this.nextTurn();
    }

    /* Generate the next turn for each enemies and the player */
    generateTurns() {
        this.turns = [];

        this.turns.push(this.map.player);

        this.map.enemies.forEach(single_enemy => {
            if (single_enemy.isAlive()) {
                this.turns.push(single_enemy);
            }
        });
    }

    /* Pick the next unit */
    nextTurn() {
        if (!this.map.player.isAlive()) {
            alert("YOU ARE DEAD!!!");
            return;
        }

        /* The Turns are empty, fill it again with the remaining units */
        if (this.turns.length == 0) {
            this.generateTurns();
        }

        let unit = this.turns.shift();
        if (unit.isAlive()) {
            this.map.bringToTop(unit);

            if (unit.type == Unit.PLAYER) {
                this.map.showActions();

                /* Enable spells buttons */
                this.buttons.forEach(single_button => {
                    single_button.enable();
                });
            } else {
                this.controlUnit(unit);
            }
        } else {
            this.nextTurn();
        }
    }

    /* Initiate an attack from ATTACKER to the DEFENDER and run a callback when it's done */
    attackUnit(attacker, defender, callback) {
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
        this.tweens.add({
            targets: attacker,
            x: defender.x,
            y: defender.y,
            ease: 'Cubic',
            duration: 150,
            onComplete: function() {
                // Start the ATTACK animation
                let effect = this.add.sprite(defender.x + (defender.width * defender.scaleX) / 2, defender.y + (defender.height * defender.scaleY) / 2, "tileset:effectsLarge");
                this.map.add(effect);
                effect.on("animationcomplete", function(tween, sprite, element) {
                    element.destroy();
                    defender.damage(attacker.attack);
                    // Move the attacker's back to its orignal position
                    this.tweens.add({
                        targets: attacker,
                        x: attacker_original_position.x,
                        y: attacker_original_position.y,
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

    /* Control a unit and select an action for it */
    controlUnit(single_enemy) {
        // Can it attack the player ?
        let diff = this.map.getDistanceBetweenUnit(this.map.player, single_enemy);

        if (diff == 1) {
            this.cameras.main.shake(500);
            this.attackUnit(single_enemy, this.map.player, this.nextTurn);
        } else {
            let pf = new Pathfinding(this.map.export(), this.map.config.width, this.map.config.height);
            let tiles = pf.find({
                x: single_enemy.gridX,
                y: single_enemy.gridY
            }, {
                x: this.map.player.gridX,
                y: this.map.player.gridY
            });

            if (tiles.length > 1) {
                let neighboor = tiles[0];
                single_enemy.move(neighboor.x, neighboor.y);
            } else {
                this.nextTurn();
            }
        }
    }

    /* Execute an action (from the Map or a Spell) */
    executeAction(action) {
        switch (action.type) {
            case Action.STAIR:
                this.map.generateMap({
                    player_health: this.map.player.health
                });

                this.generateTurns();
                this.nextTurn();
                break;
            case Action.MOVE:
                this.map.player.move(action.target.gridX, action.target.gridY);
                break;
            case Action.ATTACK:
                this.attackUnit(this.map.player, action.target, this.nextTurn);
                break;
            case Action.SPELL:
                switch (action.spell) {
                    // DASH: Move in the last position until an enemy (and attack) or a wall and stop
                    // DIG: Break walls around (but not the borders)
                    // KINGMAKER: Heal all monster and generate a chest under them
                    // ALCHEMY: Add a chest in all floor tiles surrounding us
                    // POWER: Make the attack do more damage (6)
                    // BRAVERY: Stun all enemies (allow another turn)
                    // BOLT: Generate a bolt in the last direction (4 damage)
                    // CROSS: Generate a bolt in all direction for 2 damage
                    // https://nluqo.github.io/broughlike-tutorial/stage8.html
                    case "WARP":
                        // Randomly warp the player
                        let effect = this.add.sprite(this.map.player.x + (this.map.player.width * this.map.player.scaleX) / 2, this.map.player.y + (this.map.player.height * this.map.player.scaleY) / 2, "tileset:effectsSmall");
                        this.map.add(effect);

                        effect.on("animationcomplete", function(tween, sprite, element) {
                            element.destroy();

                            let tile = this.map.pickEmptyTile();

                            let effect = this.add.sprite(tile.x, tile.y, "tileset:effectsSmall");
                            effect.x += (effect.width/2);
                            effect.y += (effect.height/2);
                            this.map.add(effect);
                            effect.on("animationcomplete", function(tween, sprite, element) {
                                element.destroy();

                                this.map.placeUnit(this.map.player, tile.gridX, tile.gridY);

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
                        this.cameras.main.shake(duration);

                        // Wait until the camera stopped shaking to resume the turn
                        this.time.addEvent({
                            delay: duration,
                            callback: function() {
                                this.nextTurn();
                            },
                            callbackScope: this
                        });

                        // Hit each enemies depending on the walls surrounding them
                        this.map.enemies.forEach(single_enemy => {
                            if (single_enemy.isAlive()) {
                                let neighboors = this.map.getAdjacentTiles(single_enemy.gridX, single_enemy.gridY);
                                let damage = 4;
                                neighboors.forEach(single_neighboor => {
                                    if (this.map.isFloorAt(single_neighboor.x, single_neighboor.y)) {
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
                        this.map.enemies.forEach(single_enemy => {
                            let effect = this.add.sprite(single_enemy.x + (single_enemy.width * single_enemy.scaleX) / 2, single_enemy.y + (single_enemy.height * single_enemy.scaleY) / 2, "tileset:effectsSmall");
                            this.map.add(effect);
                            single_enemy.is_moving = true;

                            effect.on("animationcomplete", function(tween, sprite, element) {
                                element.destroy();

                                let tile = this.map.pickEmptyTile();

                                let effect = this.add.sprite(tile.x, tile.y, "tileset:effectsSmall");
                                effect.x += (effect.width/2);
                                effect.y += (effect.height/2);
                                this.map.add(effect);
                                effect.on("animationcomplete", function(tween, sprite, element) {
                                    element.destroy();

                                    this.map.placeUnit(single_enemy, tile.gridX, tile.gridY);

                                    single_enemy.is_moving = false;
                                    let remaining_animations = this.map.enemies.filter(single_enemy => single_enemy.is_moving);
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
                        let player_health = Math.max(1, Math.floor(this.map.player.health / 2));
                        this.map.generateMap({
                            player_health: player_health
                        });

                        /* Since the player will always be first, remove the first turn to allow the enemy to have the next move */
                        this.generateTurns();
                        this.turns.shift();

                        this.nextTurn();
                        break;
                    case "AURA":
                        // Heal the player and any adjacent enemies
                        let neighboors = this.map.getAdjacentTiles(this.map.player.gridX, this.map.player.gridY);
                        neighboors.forEach(single_neighboor => {
                            let enemy_around = null;

                            this.map.enemies.forEach(single_enemy => {
                                if (single_enemy.gridX == single_neighboor.x && single_enemy.gridY == single_neighboor.y) {
                                    enemy_around = single_enemy;
                                }
                            });

                            if (enemy_around != null) {
                                let effect2 = this.add.sprite(enemy_around.x + (enemy_around.width * enemy_around.scaleX) / 2, enemy_around.y + (enemy_around.height * enemy_around.scaleY) / 2, "tileset:effectsSmall");
                                this.map.add(effect2);
                                effect2.on("animationcomplete", function(tween, sprite, element) {
                                    element.destroy();

                                    enemy_around.heal(1);
                                });
                                effect2.anims.play("heal", true);
                            }
                        });

                        let effect2 = this.add.sprite(this.map.player.x + (this.map.player.width * this.map.player.scaleX) / 2, this.map.player.y + (this.map.player.height * this.map.player.scaleY) / 2, "tileset:effectsSmall");
                        this.map.add(effect2);

                        effect2.on("animationcomplete", function(tween, sprite, element) {
                            element.destroy();

                            this.map.player.heal(1);
                            this.nextTurn();

                        }, this);

                        effect2.anims.play("heal", true);
                        break;
                }
                break;
        }
    }

    /* Events */

    /* When an action is clicked from the map */
    onMapActionClicked(action) {
        /* Disable all spells buttons */
        this.buttons.forEach(single_button => {
            single_button.disable();
        });

        this.executeAction(action);
    }

    /* When a spell is clicked */
    onSpellBtnClicked(btn) {
        btn.setCountdown();

        this.map.clearActions();

        this.executeAction({
            type: Action.SPELL,
            spell: btn.spell
        });
    }
};