import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { TILE_ASSET_KEYS } from "../keys/asset.js";
import { Tile } from "../tile.js";

const TILE_SIZE = 40;

export class DungeonScene extends Phaser.Scene {
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;
    /** @type {Phaser.GameObjects.Container} */
    #container;
    /** @type {Tile[]} */
    #tiles;

    /** @type {boolean} */
    #canSelect;
    /** @type {Tile} */
    #selectedTile;

    /** @type {Phaser.GameObjects.Sprite[]} */
    #poolSprites;

    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });

        this.#canSelect = true;
        this.#selectedTile = null;
    }

    create() {
        this.#createTiles(8, 10);

        this.input.on("pointerdown", this.#selectTile, this);
        this.input.on("pointerup", this.#unselectTile, this);
    }

    /**
     * @param {number} width 
     * @param {number} height 
     */
    #createTiles(width, height) {
        this.#width = width;
        this.#height = height;

        this.#tiles = [];
        this.#poolSprites = [];

        this.#container = this.add.container(40, 100);

        for (let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                this.#tiles.push(new Tile(x, y, -1, null));
            }
        }

        for (let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                let sprite = this.add.sprite(TILE_SIZE * x + TILE_SIZE/2, TILE_SIZE * y + TILE_SIZE/2, TILE_ASSET_KEYS.TILE);
                this.#container.add(sprite);

                // @TODO: Check to make sure it's not an infinite loop
                do {
                    // @TODO: Make sure the total number of index is dynamic
                    let randomFrameIndex = Phaser.Math.Between(0, 4);
                    sprite.setFrame(randomFrameIndex);

                    let tile = this.#getTileAt(x, y);
                    if (tile === null) {
                        continue;
                    }

                    tile.color = randomFrameIndex;
                    tile.sprite = sprite;
                } while(this.#isMatchAt(x, y));
            }
        }

        // Create a mask for the container (Hide newly added tiles)
        const mask = this.add.graphics()
        .fillStyle(0x000000, 0)
        .fillRect(this.#container.x, this.#container.y, this.#container.getBounds().width, this.#container.getBounds().height);

        this.#container.mask = new Phaser.Display.Masks.GeometryMask(this, mask);
    }

    /**
     * @returns {boolean}
     */
    #hasMatches() {
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                if (this.#isMatchAt(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    #isMatchAt(x, y) {
        // Only check vertical matches for now...
        let tile = this.#getTileAt(x, y);
        if (tile === null) {
            return false;
        }
        // Check for X tiles below
        let matchesThreshold = 3;

        for (let i = 1; i < 3; i++) {
            let otherTile = this.#getTileAt(x, y - i);
            if (otherTile === null) {
                continue;
            }
            if (tile.color === otherTile.color) {
                matchesThreshold--;
            }
        }

        return (matchesThreshold <= 1);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {Tile}
     */
    #getTileAt(x, y) {
        if(y < 0 || y >= this.#height || x < 0 || x >= this.#width) {
            return null;
        }
        let index = (y * this.#width) + x;
        if (index >= this.#tiles.length) {
            return null;
        }
        return this.#tiles[index];
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     */
    #selectTile(pointer) {
        if (!this.#canSelect) {
            return;
        }

        let x = Math.floor((pointer.x - this.#container.x) / TILE_SIZE);
        let y = Math.floor((pointer.y - this.#container.y) / TILE_SIZE);

        let tile = this.#getTileAt(x, y);
        if (tile === null) {
            return;
        }

        if (this.#selectedTile === null) {
            tile.sprite.setDepth(1);
            this.#selectedTile = tile;

            // Highlight the entire row)
            for (let i = 0; i < this.#width; i++) {
                this.#getTileAt(i, y).sprite.setScale(1.2);
            }
        }
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     */
    #unselectTile(pointer) {
        if (!this.#canSelect) {
            return;
        }
        if (this.#selectedTile === null) {
            return;
        }
        
        this.#selectedTile.sprite.setDepth(0);
        for (let i = 0; i < this.#width; i++) {
            let rowTile = this.#getTileAt(i, this.#selectedTile.y);
            if (rowTile === null) {
                continue;
            }
            rowTile.sprite.setScale(1);
        }


        let x = Math.floor((pointer.x - this.#container.x) / TILE_SIZE);
        let y = Math.floor((pointer.y - this.#container.y) / TILE_SIZE);

        let tile = this.#getTileAt(x, y);

        if (tile !== null && tile === this.#selectedTile) {
            this.#canSelect = false;

            // Delete entire selected row
            for (let i = 0; i < this.#width; i++) {
                let rowTile = this.#getTileAt(i, this.#selectedTile.y);
                if (rowTile === null) {
                    continue;
                }
                rowTile.sprite.setScale(1);
                rowTile.updateState({toRemove: true});
            }
            this.#destroyTiles();
        }

        this.#selectedTile = null;
    }

    #destroyTiles() {
        let totalTiles = 0;

        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                let tile = this.#getTileAt(x, y);
                if (tile === null) {
                    continue;
                }

                if (tile.toRemove) {
                    totalTiles++;
                    this.tweens.add({
                        targets: tile.sprite,
                        alpha: 0.5,
                        duration: 200,
                        callbackScope: this,
                        onComplete: () => {
                            totalTiles--;
                            tile.sprite.visible = false;
                            this.#poolSprites.push(tile.sprite);
                            if (totalTiles === 0) {
                                // Move row, col for each remaining tile
                                this.#moveExistingTiles();
                                // Place new tile on top
                                this.#addNewTiles();
                                // Tween each sprite to its new position
                                this.#makeTilesFall();
                            }
                        }
                    });

                    tile.updateState({isEmpty: true, toRemove: false});
                }
            }
        }
    }

    #moveExistingTiles() {
        for (let y = this.#height - 2; y >= 0; y--) {
            for (let x = 0; x < this.#width; x++) {
                let tile = this.#getTileAt(x, y);
                if (tile === null) {
                    continue;
                }

                if (tile.isEmpty) {
                    continue;
                }
                
                let holesBelow = this.#holesBelow(x, y);
                if (holesBelow > 0) {
                    let otherTile = this.#getTileAt(x, y + holesBelow);
                    otherTile.sprite = tile.sprite;
                    otherTile.color = tile.color;
                    otherTile.updateState({isEmpty: false});

                    tile.updateState({isEmpty: true});
                }
            }
        }
    }

    #makeTilesFall() {
        let totalTiles = 0;

        for (let y = this.#height - 1; y >= 0; y--) {
            for (let x = 0; x < this.#width; x++) {
                let tile = this.#getTileAt(x, y);

                if (tile === null) {
                    continue;
                }

                if (tile.isEmpty) {
                    continue;
                }

                let newY = tile.y * TILE_SIZE + TILE_SIZE / 2;
                if (newY !== tile.sprite.y) {
                    let totalHoles = (newY - tile.sprite.y) / TILE_SIZE;

                    totalTiles++;

                    this.tweens.add({
                        targets: tile.sprite,
                        y: newY,
                        duration: 100 * totalHoles,
                        callbackScope: this,
                            onComplete: () => {
                                totalTiles--;
    
                                if (totalTiles === 0) {
                                    if (this.#hasMatches()) {
                                        // Pause before removing the matches
                                        this.time.addEvent({
                                            delay: 200,
                                            callback: this.#handleMatches,
                                            callbackScope: this,
                                        });
                                    } else {
                                        this.#canSelect = true;
                                    }
                                }
                            }
                    });
                }
            }
        }
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {number}
     */
    #holesBelow(x, y) {
        let holes = 0;
        for(let y2 = y + 1; y2 < this.#height; y2++) {
            let tile = this.#getTileAt(x, y2);
            if (tile === null) {
                continue;
            }
            if (tile.isEmpty) {
                holes++;
            }
        }
        return holes;
    }

    // @TODO: Merge both holes functions

    /**
     * @param {number} x 
     * @returns {number}
     */
    #holesInCol(x) {
        let holes = 0;
        for (let y = 0; y < this.#height; y++) {
            let tile = this.#getTileAt(x, y);
            if (tile === null) {
                continue;
            }
            if (tile.isEmpty) {
                holes++;
            }
        }
        return holes;
    }

    #addNewTiles() {
        for(let x = 0; x < this.#width; x++) {
            let holes = this.#holesInCol(x);
            if (holes > 0) {
                for (let i = 0; i < holes; i ++) {
                    // @TODO: Do not repeat this code
                    let randomFrameIndex = Phaser.Math.Between(0, 4);

                    let tile = this.#getTileAt(x, i);
                    if (tile === null) {
                        continue;
                    }
                    tile.color = randomFrameIndex;
                    tile.sprite = this.#poolSprites.pop()
                    tile.sprite.setFrame(randomFrameIndex);
                    tile.sprite.visible = true;
                    tile.sprite.x = TILE_SIZE * x + TILE_SIZE / 2;
                    tile.sprite.y = TILE_SIZE / 2 - (holes - i) * TILE_SIZE;
                    tile.sprite.alpha = 1;
                    tile.sprite.setScale(1);
                    tile.updateState({isEmpty: false});
                }
            }
        }
    }

    #handleMatches() {
        let streaks = [];

        for (let x = 0; x < this.#width; x++) {
            let colorStreak = 1;
            let currentColor = -1;
            let startStreak = 0;
            let colorToWatch = 0;

            for (let y = 0; y < this.#height; y++) {
                colorToWatch = this.#getTileAt(x, y).color;
                if(colorToWatch === currentColor){
                    colorStreak++;
                }
                // Another color or at the bottom
                if (colorToWatch !== currentColor || y === this.#height - 1) {
                    let endStreak = (colorToWatch === currentColor ? y : y - 1);
                    if (colorStreak >= 3) {
                        let streak = {
                            length: colorStreak,
                            color: currentColor,
                            tiles: [],
                        }
                        for (let k = 0; k < colorStreak; k++) {
                            let tile = this.#getTileAt(x, endStreak - k);
                            if (tile === null) {
                                continue;
                            }
                            streak.tiles.push(tile);
                        }

                        streaks.push(streak);
                    }
                    startStreak = x;
                    colorStreak = 1;
                    currentColor = colorToWatch;
                }
            }
        }

        this.#removeMatches(streaks);
    }

    /**
     
     */
    #removeMatches(streaks) {
        let totalTiles = 0;

        streaks.forEach(singleStreak => {
            singleStreak.tiles.forEach(tile => {
                totalTiles++;
                this.tweens.add({
                    targets: tile.sprite,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    callbackScope: this,
                    onComplete: () => {
                        totalTiles--;

                        tile.updateState({toRemove: true});

                        if (totalTiles === 0) {
                            this.#destroyTiles();
                        }
                    }
                });
            });
        });
    }
}
