import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Pathfinding } from "../pathfinding.js";
import { StateMachine } from "../state-machine.js";
import { Unit, UNIT_TYPES } from "../unit.js";
import { Data } from "../data.js";
import { Map } from "../map.js";
import { UI_ASSET_KEYS } from "../keys/asset.js";
import { Action, ACTION_TYPE } from "../action.js";
import { Entity, ENTITY_TYPE } from "../entity.js";
import { Panel } from "../ui/panel.js";

const MAIN_STATES = Object.freeze({
    PLAYER_WAIT_ACTION: 'PLAYER_WAIT_ACTION',                   // Wait for Player action
    PLAYER_EXECUTE_ACTION: 'PLAYER_EXECUTE_ACTION',             // Execute Player action
    PLAYER_EXECUTING_ACTION: 'PLAYER_EXECUTING_ACTION',         // Execute Player action
    CHECK_EVENT: 'CHECK_EVENT',                                 // Wait for Player action
    ENEMY_TURN: 'ENEMY_TURN',                                   // Wait for Enemy Action
    ENEMY_EXECUTE_ACTION: 'ENEMY_EXECUTE_ACTION',               // Execute Enemy Action
    ENEMY_EXECUTING_ACTION: 'ENEMY_EXECUTING_ACTION',           // Execute Enemy Action
    GAME_OVER: 'GAME_OVER',                                     // You are dead
});

export class DungeonScene extends Phaser.Scene {
    /** @type {Unit} */
    #player;
    /** @type {Action[]} */
    #actions;
    /** @type {Map} */
    #map;
    /** @type {Unit[]} */
    #enemies;
    /** @type {Entity[]} */
    #entities;

    /** @type {StateMachine} */
    #stateMachine;

    /** @type {Panel} */
    #panel;
    #energy;
    #hp;
    #gold;

    #uiPaths;

    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });
    }

    create() {
        this.#enemies = [];
        this.#actions = [];
        this.#entities = [];
        this.#uiPaths = [];

        this.#gold = 0;
        this.#hp = 10;
        this.#energy = 100;

        this.#createMap();

        let emptyTiles = this.#map.getEmptyTiles();

        Phaser.Utils.Array.Shuffle(emptyTiles);
        let tile = emptyTiles.shift();

        let stair = new Entity(this, ENTITY_TYPE.STAIR, tile.x, tile.y, { frame: 46, shadow: false });
        this.#entities.push(stair);

        for (let i=0; i<10; i++) {
            Phaser.Utils.Array.Shuffle(emptyTiles);
            tile = emptyTiles.shift();
            
            let enemy = new Unit(this, UNIT_TYPES.ENEMY, tile.x, tile.y, Data.getUnitDetails(this, 'skeleton'));
            this.#enemies.push(enemy);
        }

        for (let i=0; i<10; i++) {
            Phaser.Utils.Array.Shuffle(emptyTiles);
            tile = emptyTiles.shift();
            
            let gold = new Entity(this, ENTITY_TYPE.GOLD, tile.x, tile.y, { frame: 228, value: 1, shadow: true });
            this.#entities.push(gold);
        }

        for (let i=0; i<5; i++) {
            Phaser.Utils.Array.Shuffle(emptyTiles);
            tile = emptyTiles.shift();
            
            let food = new Entity(this, ENTITY_TYPE.FOOD, tile.x, tile.y, { frame: 200, value: 5, shadow: true });
            this.#entities.push(food);
        }

        Phaser.Utils.Array.Shuffle(emptyTiles);
        tile = emptyTiles.shift();

        this.#player = new Unit(this, UNIT_TYPES.PLAYER, tile.x, tile.y, Data.getUnitDetails(this, 'fighter'));

        let camera = this.cameras.main; 

        camera.setBounds(0, -124, this.#map.width * 36, this.#map.height * 36);
        camera.startFollow(this.#player.container, true); 

        this.input.on('pointermove', this.#onTileHighlighted, this);
        this.input.on('pointerdown', this.#onTileHighlighted, this);

        this.input.on('pointerup', function (pointer) {
            this.#uiPaths.forEach(singleOverlay => {
                singleOverlay.destroy();
            });
            this.#uiPaths = [];

            if (this.#stateMachine.currentStateName !== MAIN_STATES.PLAYER_WAIT_ACTION) {
                return;
            }

            var tile = this.#map.getTileAtWorldXY(pointer.worldX, pointer.worldY);
            if (!tile) {
                return;
            }

            this.#actions = this.#getActions(tile)
            this.#stateMachine.setState(MAIN_STATES.PLAYER_EXECUTE_ACTION);
          }, this);

          this.#panel = new Panel(this);
          this.add.existing(this.#panel.container);
          this.#panel.container.setScrollFactor(0);

          this.#createStateMachine();
    }

    update() {
        this.#stateMachine.update();
    }

    #createStateMachine() {
        this.#stateMachine = new StateMachine('MAIN', this);

        this.#stateMachine.addState({
            name: MAIN_STATES.PLAYER_WAIT_ACTION,
            onEnter: () => {
                this.#player.idle();
                // ...
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.CHECK_EVENT,
            onEnter: () => {
                let newEnemyAwaken = false;

                this.#enemies.forEach(singleEnemy => {
                    if (!singleEnemy.isAlive) {
                        return;
                    }
                    this.#map.getTiles().forEach(tile => {
                        if (tile.x === singleEnemy.x && tile.y === singleEnemy.y && tile.tint === 0xffffff) {
                            // singleEnemy.activate();

                            let text = this.add.bitmapText(singleEnemy.gameObject.x, singleEnemy.gameObject.y, UI_ASSET_KEYS.LARGE_FONT, "!", 36).setTint(0xffffff).setOrigin(0.5, 1); 
                            this.tweens.add({
                                targets: text,
                                y: text.y - 20,
                                alpha: 0,
                                duration: 2000,
                                ease: Phaser.Math.Easing.Sine.Out,
                                onComplete: () => {
                                    text.destroy();
                                }
                            });

                            newEnemyAwaken = true;
                        }
                    });
                });

                if (newEnemyAwaken) {
                    // this.#actions = [];
                }

                if (this.#actions.length > 0) {
                    this.#stateMachine.setState(MAIN_STATES.PLAYER_EXECUTE_ACTION);
                } else {
                    this.#stateMachine.setState(MAIN_STATES.ENEMY_TURN);
                }
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.PLAYER_EXECUTE_ACTION,
            onEnter: () => {
                this.#energy--;
                this.#panel.updateEnergy(this.#energy);

                if (this.#actions.length === 0) {
                    this.#stateMachine.setState(MAIN_STATES.ENEMY_TURN);
                } else {
                    this.#stateMachine.setState(MAIN_STATES.PLAYER_EXECUTING_ACTION);

                    let action = this.#actions.shift();

                    if (action.type === ACTION_TYPE.MOVE) {
                        this.#player.move(action.data.x, action.data.y, () => {
                            this.#stateMachine.setState(MAIN_STATES.CHECK_EVENT);
                        });
                    } else if (action.type === ACTION_TYPE.MELEE) {
                        this.#player.attackUnit(action.data, () => {
                            this.#hp--;
                            this.#panel.updateHp(this.#hp);

                            this.#player.move(action.data.x, action.data.y, () => {
                                this.#stateMachine.setState(MAIN_STATES.CHECK_EVENT);
                            });
                        });
                    } else if (action.type === ACTION_TYPE.USE) {
                        if (action.data.type === ENTITY_TYPE.STAIR) {
                            this.#player.move(action.data.x, action.data.y, () => {
                                this.#player.idle();
                                this.scene.restart();
                            });
                            return;
                        }
                        if (action.data.type === ENTITY_TYPE.GOLD) {
                            this.#player.move(action.data.x, action.data.y, () => {
                                action.data.use();
                                this.#gold += action.data._details.value;

                                this.#entities = this.#entities.filter(singleEntity => singleEntity !== action.data);
                                this.#panel.updateGold(this.#gold);
                                this.#stateMachine.setState(MAIN_STATES.CHECK_EVENT);
                            });
                            return;
                        }
                        if (action.data.type === ENTITY_TYPE.FOOD) {
                            this.#player.move(action.data.x, action.data.y, () => {
                                action.data.use();
                                this.#energy += action.data._details.value;

                                this.#entities = this.#entities.filter(singleEntity => singleEntity !== action.data);
                                this.#panel.updateEnergy(this.#energy);
                                this.#stateMachine.setState(MAIN_STATES.CHECK_EVENT);
                            });
                            return;
                        }
                    } 
                }
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.PLAYER_EXECUTING_ACTION,
            onEnter: () => {
                // this.#stateMachine.setState(MAIN_STATES.PLAYER_EXECUTE_ACTION);
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.ENEMY_TURN,
            onEnter: () => {
                let enemiesActions = [];

                

                if (enemiesActions.length > 0) {
                    this.#actions = enemiesActions;

                    this.#stateMachine.setState(MAIN_STATES.ENEMY_EXECUTE_ACTION);
                } else {
                    this.#stateMachine.setState(MAIN_STATES.PLAYER_WAIT_ACTION);
                }
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.ENEMY_EXECUTE_ACTION,
            onEnter: () => {
                if (this.#actions.length === 0) {
                    this.#stateMachine.setState(MAIN_STATES.PLAYER_WAIT_ACTION);
                } else {
                    this.#stateMachine.setState(MAIN_STATES.ENEMY_EXECUTING_ACTION);

                    let action = this.#actions.shift();

                    if (action.type === ACTION_TYPE.MOVE) {
                        action.unit.move(action.data.x, action.data.y, () => {
                            this.#stateMachine.setState(MAIN_STATES.ENEMY_EXECUTE_ACTION);
                        });
                    } else if (action.type === ACTION_TYPE.MELEE) {
                        action.unit.attackUnit(action.data, () => {
                            this.#stateMachine.setState(MAIN_STATES.ENEMY_EXECUTE_ACTION);
                        });
                    }
                }
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.ENEMY_EXECUTING_ACTION,
            onEnter: () => {
                // this.#stateMachine.setState(MAIN_STATES.PLAYER_EXECUTE_ACTION);
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.GAME_OVER,
            onEnter: () => {
                // ...
            },
        });

        this.#stateMachine.setState(MAIN_STATES.PLAYER_WAIT_ACTION);
    }

    #createMap() {
        this.#map = new Map(this);
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     */
    #onTileHighlighted(pointer) {
        this.#uiPaths.forEach(singleOverlay => {
            singleOverlay.destroy();
        });
        this.#uiPaths = [];

        if (this.#stateMachine.currentStateName !== MAIN_STATES.PLAYER_WAIT_ACTION) {
            return;
        }

        var tile = this.#map.getTileAtWorldXY(pointer.worldX, pointer.worldY);
        if (!tile) {
            return;
        }

        const diffX = Math.abs(this.#player.x - tile.x);
        const diffY = Math.abs(this.#player.y - tile.y);

        if (diffX < diffY) {
            this.#player.face(this.#player.y > tile.y ? "Top" : "Bottom");
        } else {
            this.#player.face(this.#player.x > tile.x ? "Left" : "Right");
        }

        let actions = this.#getActions(tile);

        actions.forEach((singleAction) => {
            let frame = 0;
            if (singleAction.type === ACTION_TYPE.MELEE) {
                frame = 1;
            } else if (singleAction.type === ACTION_TYPE.USE) {
                frame = 2;
            }
            let img = this.add.image((singleAction.data.x * 36) + 18, (singleAction.data.y * 36) + 18, UI_ASSET_KEYS.ACTION, frame);
            this.#uiPaths.push(img);
        });
    }

    #getMapLayoutWithEntities() {
        let layout = JSON.parse(JSON.stringify(this.#map.layout));

        // Add enemy in array to prevent going over them
        this.#enemies.forEach(singleEnemy => {
            if (singleEnemy.isAlive) {
                layout[singleEnemy.y][singleEnemy.x] = 1;
            }
        });

        // Add entity in array to prevent going over them
        this.#entities.forEach(singleEnemy => {
            layout[singleEnemy.y][singleEnemy.x] = 1;
        });

        return layout;
    }

    /**
     * @param {Phaser.Tilemaps.Tile} tile 
     */
    #getActions(tile) {
        const actions = [];

        // Check if the player clicked on an enemy
        let enemy = this.#enemies.find(singleEnemy => singleEnemy.isAlive && singleEnemy.x === tile.x && singleEnemy.y === tile.y);
        if (enemy) {
            const layout = this.#getMapLayoutWithEntities();
            layout[enemy.y][enemy.x] = 0;

            let pathFinding = new Pathfinding(layout, this.#map.width, this.#map.height);
            let paths = pathFinding.find(
                {x: this.#player.x, y: this.#player.y},
                {x: tile.x, y: tile.y}
            );

            // Remove the last path as it is the enemy
            paths.pop();

            paths.forEach((single_path) => {
                actions.push(new Action(this.#player, ACTION_TYPE.MOVE, {
                    x: single_path.x,
                    y: single_path.y
                }));
            });

            actions.push(new Action(this.#player, ACTION_TYPE.MELEE, enemy));

            return actions;
        }

        let entity = this.#entities.find(singleEntity => singleEntity.x === tile.x && singleEntity.y === tile.y);
        if (entity) {
            const layout = this.#getMapLayoutWithEntities();
            layout[entity.y][entity.x] = 0;

            let pathFinding = new Pathfinding(layout, this.#map.width, this.#map.height);
            let paths = pathFinding.find(
                {x: this.#player.x, y: this.#player.y},
                {x: tile.x, y: tile.y}
            );

            // Remove the last path as it is the enemy
            paths.pop();

            paths.forEach((single_path) => {
                actions.push(new Action(this.#player, ACTION_TYPE.MOVE, {
                    x: single_path.x,
                    y: single_path.y
                }));
            });

            actions.push(new Action(this.#player, ACTION_TYPE.USE, entity));

            return actions;
        }


        // Just walk around
        let pathFinding = new Pathfinding(this.#getMapLayoutWithEntities(), this.#map.width, this.#map.height);
        let paths = pathFinding.find(
            {x: this.#player.x, y: this.#player.y},
            {x: tile.x, y: tile.y}
        );

        if (paths.length > 0) {
            paths.forEach((single_path) => {
                actions.push(new Action(this.#player, ACTION_TYPE.MOVE, {
                    x: single_path.x,
                    y: single_path.y
                }));
            });
        }

        return actions;
    }
}