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

    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });
    }

    create() {
        this.#createMap();
        this.#createStateMachine();

        this.#enemies = [];
        this.#actions = [];
        this.#entities = [];

        let details = Data.getUnitDetails(this, 'fighter');
        this.#player = new Unit(this, UNIT_TYPES.PLAYER, 10, 5, details);

        details = Data.getUnitDetails(this, 'skeleton');

        let enemy = new Unit(this, UNIT_TYPES.ENEMY, 1, 10, details);
        this.#enemies.push(enemy);

        let stair = new Entity(this, ENTITY_TYPE.STAIR, 4, 4, details);
        this.#entities.push(stair);

        let camera = this.cameras.main; 

        camera.setBounds(0, 0, this.#map.width * 36, this.#map.height * 36);
        camera.startFollow(this.#player.container, true); 

        this.input.on('pointermove', this.#faceDirection, this);
        this.input.on('pointerdown', this.#faceDirection, this);

        this.input.on('pointerup', function (pointer) {
            if (this.#stateMachine.currentStateName !== MAIN_STATES.PLAYER_WAIT_ACTION) {
                return;
            }

            const direction = this.#player.gameObject.anims.currentAnim.key.substr(4);
            let x = 0;
            let y = 0;
            if (direction === 'Top') {
                y = -1;
            } else if (direction === 'Bottom') {
                y = 1;
            } else if (direction === 'Left') {
                x = -1;
            } else if (direction === 'Right') {
                x = 1;
            }

            var tile = this.#map.getTileAt(this.#player.x + x, this.#player.y + y);
            if (!tile) {
                return;
            }

            this.#actions.push({
                unit: this.#player,
                type: ACTION_TYPE.MOVE,
                data: {
                    x: tile.x,
                    y: tile.y,
                },
            });
            this.#stateMachine.setState(MAIN_STATES.PLAYER_EXECUTE_ACTION);

          }, this);
    }

    update() {
        this.#stateMachine.update();
    }

    #createStateMachine() {
        this.#stateMachine = new StateMachine('MAIN', this);

        this.#stateMachine.addState({
            name: MAIN_STATES.PLAYER_WAIT_ACTION,
            onEnter: () => {
                // ...
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.CHECK_EVENT,
            onEnter: () => {
                // @TODO: Check this sooner
                this.#entities.forEach(singleEntity => {
                    if (singleEntity.isActive) {
                        return;
                    }
                    this.#map.getTiles().forEach(tile => {
                        if (tile.x === singleEntity.x && tile.y === singleEntity.y && tile.tint === 0xffffff) {
                            singleEntity.activate();
                        }
                    });
                });

                let newEnemyAwaken = false;

                this.#enemies.forEach(singleEnemy => {
                    if (singleEnemy.isActive || !singleEnemy.isAlive) {
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
                    this.#actions = [];
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
                            this.#stateMachine.setState(MAIN_STATES.CHECK_EVENT);
                        });
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

                // Check if enemies are alerted
                // If yes, move towards player
                this.#enemies.forEach(singleEnemy => {
                    if (singleEnemy.isActive) {
                        let pathFinding = new Pathfinding(this.#map.layout, this.#map.width, this.#map.height);
                        let paths = pathFinding.find(
                            {x: singleEnemy.x, y: singleEnemy.y},
                            {x: this.#player.x, y: this.#player.y}
                        );
                        if (paths.length === 1) {
                            enemiesActions.push(new Action(singleEnemy, ACTION_TYPE.MELEE, this.#player));
                        } else if (paths.length > 0) {
                            enemiesActions.push(new Action(singleEnemy, ACTION_TYPE.MOVE, {x: paths[0].x, y: paths[0].y}));
                        }
                    }
                });

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

    #faceDirection(pointer) {
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
    }

    #getMapLayoutPlayer() {
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
}