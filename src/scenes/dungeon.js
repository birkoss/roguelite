import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { TILE_ASSET_KEYS, UI_ASSET_KEYS } from "../keys/asset.js";
import { Tile } from "../tile.js";
import { Block } from "../block.js";
import { Panel } from "../panel.js";

const TILE_SIZE = 44;

/**
 * @typedef {Object} Streak
 * @property {number} bonus
 * @property {Tile[]} tiles
 */

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

    /** @type {Block[]} */
    #blocksPooled;

    /** @type {Panel} */
    #panel;

    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });

        this.#canSelect = true;
        this.#selectedTile = null;
    }

    create() {
        this.#createTiles(8, 10);

        this.#panel = new Panel(this, 0, 0);

        this.input.on("pointerdown", this.#selectTile, this);
        this.input.on("pointerup", this.#unselectTile, this);
    }

    /**
     * Create the tiles and blocks for the dungeon
     * @param {number} width 
     * @param {number} height 
     */
    #createTiles(width, height) {
        this.#width = width;
        this.#height = height;

        this.#tiles = [];
        this.#blocksPooled = [];

        this.#container = this.add.container(40, 100);

        // Create the tiles and blocks
        for (let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                let container = this.add.container(TILE_SIZE * x + TILE_SIZE/2, TILE_SIZE * y + TILE_SIZE/2);
                let background = this.add.sprite(0, 0, TILE_ASSET_KEYS.TILE);
                container.add(background);
                let icon = this.add.sprite(0, 0, TILE_ASSET_KEYS.ICON);
                container.add(icon);
                this.#container.add(container);

                let tile = new Tile(x, y, new Block(container, background, icon));
                this.#tiles.push(tile);
            }
        }

        // Create the block background and icon
        for (let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                let tile = this.#getTileAt(x, y);
                if (tile === null) {
                    continue;
                }

                let maxTries = 10;
                do {
                    maxTries--;
                    tile.block.updateColor(this.#generateRandomColor());
                } while(this.#isMatchAt(x, y) && maxTries > 0);
                // TODO: Warn the player if maxTries === 0 (or retry)
            }
        }

        // Create a mask for the container (Hide reused tiles)
        const mask = this.add.graphics()
            .fillStyle(0x000000, 0)
            .fillRect(this.#container.x, this.#container.y, this.#container.getBounds().width, this.#container.getBounds().height);
        this.#container.mask = new Phaser.Display.Masks.GeometryMask(this, mask);
    }

    /**
     * Determine if there are any matches on the board
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
     * Determine if there are any matches at the specified coordinates
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
            if (tile.block.color === otherTile.block.color) {
                matchesThreshold--;
            }
        }

        return (matchesThreshold <= 1);
    }

    /**
     * Get a tile at the specified coordinates
     * - Returns null if the coordinates are out of bounds
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
     * Called when the player selects a tile
     * - Highlights the entire row
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
            this.#selectedTile = tile;

            // Highlight the entire row)
            for (let i = 0; i < this.#width; i++) {
                let otherTile = this.#getTileAt(i, y);
                if (otherTile === null) {
                    continue;
                }
                otherTile.block.highlight();
            }
        }
    }

    /**
     * Called when the player unselects a tile
     * - Removes the highlight from the entire row
     * - Removes the row if already selected
     * @param {Phaser.Input.Pointer} pointer 
     */
    #unselectTile(pointer) {
        if (!this.#canSelect) {
            return;
        }
        if (this.#selectedTile === null) {
            return;
        }
        
        for (let i = 0; i < this.#width; i++) {
            let rowTile = this.#getTileAt(i, this.#selectedTile.y);
            if (rowTile === null) {
                continue;
            }
            rowTile.block.unhighlight();
        }


        let x = Math.floor((pointer.x - this.#container.x) / TILE_SIZE);
        let y = Math.floor((pointer.y - this.#container.y) / TILE_SIZE);

        let tile = this.#getTileAt(x, y);
        if (tile !== null && tile === this.#selectedTile) {
            this.#canSelect = false;

            let streak = {
                bonus: 1,
                tiles: [],
            }
            // Delete entire selected row
            for (let i = 0; i < this.#width; i++) {
                let rowTile = this.#getTileAt(i, this.#selectedTile.y);
                if (rowTile === null) {
                    continue;
                }
                streak.tiles.push(rowTile);
            }
            
            this.#destroyStreaks([streak]);
        }

        this.#selectedTile = null;
    }

    /**
     * Move the existing tiles down to fill in the holes
     */
    #moveExistingTiles() {
        for (let y = this.#height - 2; y >= 0; y--) {
            for (let x = 0; x < this.#width; x++) {
                let tile = this.#getTileAt(x, y);
                if (tile === null || tile.isEmpty) {
                    continue;
                }
                
                let holes = this.#getHolesBelow(x, y);
                if (holes > 0) {
                    let otherTile = this.#getTileAt(x, y + holes);
                    otherTile.block = tile.block;
                    otherTile.updateState({isEmpty: false});

                    tile.updateState({isEmpty: true});
                }
            }
        }
    }

    /**
     * Tween the tiles to fall into their new positions
     */
    #makeTilesFall() {
        let totalTiles = 0;

        for (let y = this.#height - 1; y >= 0; y--) {
            for (let x = 0; x < this.#width; x++) {
                let tile = this.#getTileAt(x, y);
                if (tile === null || tile.isEmpty) {
                    continue;
                }

                let newY = tile.y * TILE_SIZE + TILE_SIZE / 2;
                if (newY !== tile.block.container.y) {
                    let totalHoles = (newY - tile.block.container.y) / TILE_SIZE;

                    totalTiles++;

                    this.tweens.add({
                        targets: tile.block.container,
                        y: newY,
                        duration: 100 * totalHoles,
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
     * Return the number of empty tiles below the specified tile
     * - Used to determine how many tiles to move down
     * @param {number} x
     * @param {number} [y]
     * @returns {number}
     */
    #getHolesBelow(x, y = -1) {
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

    /**
     * Add new tiles to the top of the grid from the block pool
     */
    #addNewTiles() {
        for(let x = 0; x < this.#width; x++) {
            let holes = this.#getHolesBelow(x);
            if (holes > 0) {
                for (let i = 0; i < holes; i ++) {
                    let tile = this.#getTileAt(x, i);
                    if (tile === null) {
                        continue;
                    }

                    tile.block = this.#blocksPooled.pop();

                    tile.block.updateColor(this.#generateRandomColor());
                    tile.block.icon.setAlpha(1);

                    tile.block.container.visible = true;
                    tile.block.container.x = TILE_SIZE * x + TILE_SIZE / 2;
                    tile.block.container.y = TILE_SIZE / 2 - (holes - i) * TILE_SIZE;
                    tile.block.container.alpha = 1;
                    tile.block.unhighlight();
                    tile.updateState({isEmpty: false});
                }
            }
        }
    }

    /**
     * Handle the matches on the board
     * - Find streaks of 3 or more tiles of the same color
     */
    #handleMatches() {
        let streaks = [];

        for (let x = 0; x < this.#width; x++) {
            let colorStreak = 1;
            let currentColor = -1;
            let startStreak = 0;
            let colorToWatch = 0;

            for (let y = 0; y < this.#height; y++) {
                let tile = this.#getTileAt(x, y);
                if (tile === null) {
                    continue;
                }

                colorToWatch = tile.block.color;
                if(colorToWatch === currentColor){
                    colorStreak++;
                }
                // Another color or at the bottom
                if (colorToWatch !== currentColor || y === this.#height - 1) {
                    let endStreak = (colorToWatch === currentColor ? y : y - 1);
                    if (colorStreak >= 3) {
                        let streak = {
                            bonus: (colorStreak === 3 ? 2 : 3),
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

        this.#destroyStreaks(streaks);
    }

    /**
     * Pick a random color from the available colors
     * - Used to pick an icon for the tile's block
     * @returns {number}
     */
    #generateRandomColor() {
        // TODO: Make sure the total number of index is dynamic
        return Phaser.Math.Between(0, 4);
    }

    /**
     * Destroy the streaks
     * - First animate the tiles and points
     * - Then hide the tiles and replenish the board
     * @param {Streak[]} streaks
     * @param {number} [currentStreak]
     */
    #destroyStreaks(streaks, currentStreak = 0) {
        if (currentStreak >= streaks.length) {
            this.time.addEvent({
                delay: 200,
                callback: () => {
                    this.#HideStreakTiles(streaks);
                }
            });

            return;
        }

        this.#animateStreakTiles(streaks, currentStreak);
    }

    /**
     * Animate the tiles of a specific streak until all streaks have been animated
     * @param {Streak[]} streaks
     * @param {number} currentStreak
     * @param {number} [currentTile]
     */
    #animateStreakTiles(streaks, currentStreak, currentTile = 0) {
        if (currentTile >= streaks[currentStreak].tiles.length) {
            this.time.addEvent({
                delay: 200,
                callback: () => {
                    this.#destroyStreaks(streaks, currentStreak + 1);
                }
            });
            return;
        }

        let tile = streaks[currentStreak].tiles[currentTile];
        if (tile === null) {
            return;
        }

        let text = this.add.bitmapText(0, -5, UI_ASSET_KEYS.LARGE_FONT, "+" + (tile.block.value * streaks[currentStreak].bonus), 21).setTint(0xffffff).setOrigin(0.5, 0.5); 
        text.setAlpha(0);
        tile.block.showValue(text);
        
        this.tweens.add({
            targets: text,
            y: text.y - 10,
            duration: 200,
            scale: 1.2,
            yoyo: true,
            ease: Phaser.Math.Easing.Sine.InOut,
        });

        this.tweens.add({
            targets: tile.block.icon,
            alpha: 0.5,
            duration: 200,
            ease: Phaser.Math.Easing.Sine.InOut,
        });

        this.tweens.add({
            targets: text,
            alpha: 1,
            y: text.y - 10,
            duration: 200,
            ease: Phaser.Math.Easing.Sine.InOut,
            onComplete: () => {
                this.time.addEvent({
                    delay: 500,
                    callback: () => {
                        this.tweens.add({
                            targets: text,
                            alpha: 0,
                            duration: 200,
                            ease: Phaser.Math.Easing.Sine.InOut,
                        });
                    }
                });
            }
        });

        this.time.addEvent({
            delay: 75,
            callback: () => {
                this.#animateStreakTiles(streaks, currentStreak, currentTile+1);
            }
        });
    }

    /**
     * Hide all the tiles in the all the streaks
     * @param {Streak[]} streaks
     */
    #HideStreakTiles(streaks) {
        let totalTiles = 0;

        streaks.forEach(singleStreak => {
            totalTiles += singleStreak.tiles.length;

            singleStreak.tiles.forEach(singleTile => {
                this.tweens.add({
                    targets: singleTile.block.container,
                    alpha: 0,
                    duration: 500,
                    ease: Phaser.Math.Easing.Sine.InOut,
                    onComplete: () => {
                        totalTiles--;
    
                        singleTile.block.clear();
                        this.#blocksPooled.push(singleTile.block);
    
                        singleTile.updateState({isEmpty: true, toRemove: false});
    
                        singleTile.block.container.visible = false;
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
            });
        });
    }
}
