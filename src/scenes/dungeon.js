import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { TILE_ASSET_KEYS } from "../keys/asset.js";

const TILE_SIZE = 40;

export class DungeonScene extends Phaser.Scene {

    #tiles;
    #poolTiles;
    #rows;
    #cols;
    #container;

    #canSelect;
    #selectedTile;

    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });
    }

    create() {
        this.#canSelect = true;
        this.#selectedTile = null;

        this.#createTiles(8, 10);

        this.input.on("pointerdown", this.#selectTile, this);
        this.input.on("pointerup", this.#unselectTile, this);
    }

    update() {
    }

    #createTiles(cols, rows) {
        this.#rows = rows;
        this.#cols = cols;

        this.#tiles = [];
        this.#poolTiles = [];

        this.#container = this.add.container(40, 100);

        for (let row = 0; row < rows; row++) {
            this.#tiles[row] = [];
            for(let col = 0; col < cols; col++) {
                let tile = this.add.sprite(TILE_SIZE * col + TILE_SIZE/2, TILE_SIZE * row + TILE_SIZE/2, TILE_ASSET_KEYS.TILE);
                this.#container.add(tile);

                do {
                    // @TODO: Make sure the total number of index is dynamic
                    let randomFrameIndex = Phaser.Math.Between(0, 4);
                    tile.setFrame(randomFrameIndex);
                    this.#tiles[row][col] = {
                        color: randomFrameIndex,
                        col: col,
                        row: row,
                        sprite: tile,
                        isEmpty: false,
                        toRemove: false,
                    }
                } while(this.#isMatchAt(row, col));
            }
        }

        /*
    const mask = this.make.graphics({add:false})
      .fillStyle(1000000, 0.5)
      .fillCircle(0, 0, 200);

    container.mask = new Phaser.Display.Masks.GeometryMask(this, mask);
        */
    }

    #hasMatches() {
        for (let row = 0; row < this.#rows; row++) {
            for (let col = 0; col < this.#cols; col++) {
                if (this.#isMatchAt(row, col)){
                    return true;
                }
            }
        }
        return false;
    }

    #isMatchAt(row, col) {
        // Only check vertical matches for now...
        return this.#tileAt(row, col).color == this.#tileAt(row - 1, col).color && this.#tileAt(row, col).color == this.#tileAt(row - 2, col).color;
    }

    #tileAt(row, col) {
        if(row < 0 || row >= this.#rows || col < 0 || col >= this.#cols){
            return -1;
        }
        return this.#tiles[row][col];
    }

    #selectTile(pointer) {
        if (!this.#canSelect) {
            return;
        }

        let row = Math.floor((pointer.y - this.#container.y) / TILE_SIZE);
        let col = Math.floor((pointer.x - this.#container.x) / TILE_SIZE);

        let tile = this.#tileAt(row, col);
        if (tile === -1) {
            return;
        }

        if (this.#selectedTile === null) {
            tile.sprite.setDepth(1);
            this.#selectedTile = tile;

            // Highlight the entire row)
            for (let i = 0; i < this.#cols; i++) {
                this.#tileAt(row, i).sprite.setScale(1.2);
            }
        }
    }

    #unselectTile(pointer) {
        if (!this.#canSelect) {
            return;
        }
        if (this.#selectedTile === null) {
            return;
        }
        
        this.#selectedTile.sprite.setDepth(0);

        // Unhighlight the entire row)
        for (let i = 0; i < this.#cols; i++) {
            this.#tileAt(this.#selectedTile.row, i).sprite.setScale(1);
        }
        
        let row = Math.floor((pointer.y - this.#container.y) / TILE_SIZE);
        let col = Math.floor((pointer.x - this.#container.x) / TILE_SIZE);

        let tile = this.#tileAt(row, col);
        if (tile === -1) {
            return;
        }

        if (tile === this.#selectedTile) {
            // Delete entire row
            for (let i = 0; i < this.#cols; i++) {
                this.#tileAt(this.#selectedTile.row, i).toRemove = true;;
            }
            // tile.toRemove = true;
            this.#canSelect = false;
            this.#destroyTiles();
        }

        this.#selectedTile = null;
    }

    #destroyTiles() {
        let totalTiles = 0;

        for (let row = 0; row < this.#rows; row++) {
            for (let col = 0; col < this.#cols; col++) {
                let tile = this.#tileAt(row, col);

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
                            this.#poolTiles.push(tile.sprite);
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

                    tile.isEmpty = true;
                    tile.toRemove = false;
                }
            }
        }
    }

    #moveExistingTiles() {
        for (let row = this.#rows - 2; row >= 0; row--) {
            for (let col = 0; col < this.#cols; col++) {
                let tile = this.#tileAt(row, col);
                if (tile.isEmpty) {
                    continue;
                }
                
                let holesBelow = this.#holesBelow(row, col);
                if (holesBelow > 0) {
                    this.#tiles[row + holesBelow][col] = {
                        sprite: tile.sprite,
                        color: tile.color,
                        isEmpty: false,
                        row: row + holesBelow,
                        col: col,
                    }
                    tile.isEmpty = true;
                }
            }
        }
    }

    #makeTilesFall() {
        let totalTiles = 0;

        for (let row = this.#rows - 2; row >= 0; row--) {
            for (let col = 0; col < this.#cols; col++) {
                let tile = this.#tileAt(row, col);
                if (tile.isEmpty) {
                    continue;
                }

                let newY = tile.row * TILE_SIZE + TILE_SIZE / 2;
                if (newY !== tile.sprite.y) {
                    let totalHoles = (newY - tile.sprite.y) / TILE_SIZE;

                    totalTiles++;

                    this.tweens.add({
                        targets: tile.sprite,
                        y: newY,
                        duration: 200 * totalHoles,
                        callbackScope: this,
                            onComplete: () => {
                                totalTiles--;
    
                                if (totalTiles === 0) {
                                    if (this.#hasMatches()) {
                                        // Pause before removing the matches
                                        this.time.addEvent({
                                            delay: 100,
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

    #holesBelow(row, col) {
        let holes = 0;
        for(let i = row + 1; i < this.#rows; i ++) {
            if(this.#tileAt(i, col).isEmpty) {
                holes++;
            }
        }
        return holes;
    }

    #addNewTiles() {
        let totalTiles = 0;

        for(let col = 0; col < this.#cols; col++) {
            let holes = this.#holesInCol(col);
            if (holes > 0) {
                for (let i = 0; i < holes; i ++) {
                    totalTiles++;
                    // @TODO: Do not repeat this code
                    let randomFrameIndex = Phaser.Math.Between(0, 4);
                    this.#tiles[i][col].color = randomFrameIndex;
                    this.#tiles[i][col].sprite = this.#poolTiles.pop()
                    this.#tiles[i][col].sprite.setFrame(randomFrameIndex);
                    this.#tiles[i][col].sprite.visible = true;
                    this.#tiles[i][col].sprite.x = TILE_SIZE * col + TILE_SIZE / 2;
                    this.#tiles[i][col].sprite.y = TILE_SIZE / 2 - (holes - i) * TILE_SIZE;
                    this.#tiles[i][col].row = i;
                    this.#tiles[i][col].col = col;
                    this.#tiles[i][col].sprite.alpha = 1;
                    this.#tiles[i][col].isEmpty = false;

                    // this.tweens.add({
                    //     targets: this.#tiles[i][col].sprite,
                    //     y: TILE_SIZE * i + TILE_SIZE / 2,
                    //     duration: 200 * holes,
                    //     callbackScope: this,
                    //     onComplete: () => {
                    //         totalTiles--;

                    //         if (totalTiles === 0) {
                    //             if (this.#hasMatches()) {
                    //                 // Pause before removing the matches
                    //                 this.time.addEvent({
                    //                     delay: 200,
                    //                     callback: this.#handleMatches,
                    //                     callbackScope: this,
                    //                 });
                    //             } else {
                    //                 this.#canSelect = true;
                    //             }
                    //         }
                    //     }
                    // });
                }
            }
        }
    }

    #holesInCol(col){
        let holes = 0;
        for(let row = 0; row < this.#rows; row++) {
            if(this.#tiles[row][col].isEmpty) {
                holes++;
            }
        }
        return holes;
    }

    #handleMatches() {
        for (let col = 0; col < this.#cols; col++) {
            let colorStreak = 1;
            let currentColor = -1;
            let startStreak = 0;
            let colorToWatch = 0;

            for (let row = 0; row < this.#rows; row++) {
                colorToWatch = this.#tileAt(row, col).color;
                if(colorToWatch === currentColor){
                    colorStreak++;
                }
                // Another color or last row
                if (colorToWatch !== currentColor || row === this.#rows - 1) {
                    let endStreak = (colorToWatch === currentColor ? row : row - 1);
                    if (colorStreak >= 3) {
                        console.log("Streak Length = " + colorStreak + " :: Start = (" + startStreak + "," + endStreak + ") :: Color = " + currentColor);

                        for (let k = 0; k < colorStreak; k++) {
                            this.#tiles[endStreak - k][startStreak].toRemove = true;
                        }
                    }
                    startStreak = col;
                    colorStreak = 1;
                    currentColor = colorToWatch;
                }
            }
        }

        this.#destroyTiles();
    }
}