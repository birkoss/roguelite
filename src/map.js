import Phaser from './lib/phaser.js';

import { DUNGEON_ASSET_KEYS } from './keys/asset.js';
import { Decoration } from './decoration.js';

export class Map {
    _layout;
    _tilemap;
    /** @type {Phaser.Tilemaps.TilemapLayer} */
    _layerBackground;
    /** @type {Phaser.Tilemaps.TilemapLayer} */
    _layerShadow;

    /**
     * @param {Phaser.Scene} scene */
    constructor(scene) {
        this._scene = scene;

        this._layout = this.#generateLayout(20, 40);

        // this._layout = [
        //     [1, 1, 1, 1, 1, 1, 1, 1, 1],
        //     [1, 0, 0, 0, 0, 0, 0, 0, 1],
        //     [1, 0, 1, 1, 1, 1, 0, 0, 1],
        //     [1, 0, 1, 0, 0, 0, 1, 0, 1],
        //     [1, 0, 0, 0, 0, 0, 0, 0, 1],
        //     [1, 1, 1, 1, 1, 1, 1, 1, 1],
        // ];

        const decorations = [];

        for (let y = 0; y < this._layout.length; y++) {
            for (let x = 0; x < this._layout[y].length; x++) {
                if (this._layout[y][x] !== 1) {
                    continue;
                }

                let value = 1;
                let tiles = [];
                this.#floodfill(tiles, x, y, 1);
                if (tiles.length === 1) {
                    value = 2;
                } else if (tiles.length >= 4 && tiles.length <= 10) {
                    value = 2;
                }
                tiles.forEach((singleTile) => {
                    this._layout[singleTile.y][singleTile.x] = value;
                });

                if (value > 1) {
                    decorations.push(tiles);
                }
            }
        }

        this._tilemap = this._scene.make.tilemap({
            tileWidth: 36,
            tileHeight: 36,
            width: this._layout[0].length,
            height: this._layout.length,
        });
        const tileset = this._tilemap.addTilesetImage(DUNGEON_ASSET_KEYS.DUNGEON, null, 36, 36);

        this._layerBackground = this._tilemap.createBlankLayer("BACKGROUND", tileset);
        this._layerBackground.putTilesAt(this.#getLayoutToBackground(this._layout), 0, 0);

        decorations.forEach((singleDecoration) => {
            let frames = [104, 105];
            if (singleDecoration.length === 1) {
                frames = [178, 179];
            } 
            singleDecoration.forEach((singleTile) => {
                let decoration = new Decoration(this._scene, singleTile.x, singleTile.y, frames);
            });
        });

        this._layerShadow = this._tilemap.createBlankLayer("SHADOW", tileset);
        this._layerShadow.putTilesAt(this.#getLayoutToShadow(this._layout), 0, 0);
    }

    /** @type {number} */
    get width() {
        return this._tilemap.width;
    }

    /** @type {number} */
    get height() {
        return this._tilemap.height;
    }

    get layout() {
        return this._layout;
    }

    /**
     * @param {number} worldX 
     * @param {number} worldY 
     * @returns {Phaser.Tilemaps.Tile | null}
     */
    getTileAtWorldXY(worldX, worldY) {
        return this._tilemap.getTileAtWorldXY(worldX, worldY, false, this._scene.cameras.main, this._layerBackground);
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    getTileAt(x, y) {
        return this._tilemap.getTileAt(x, y, false, this._layerBackground);
    }

    getTiles() {
        return this._layerBackground.getTilesWithin();
    }

    /**
     * @param {object[]} tiles
     * @param {number} x
     * @param {number} y
     * @param {number} value
     */
    #floodfill(tiles, x, y, value) {
        if (x < 0 || x >= this._layout[0].length || y < 0 || y >= this._layout.length) {
            return [];
        }

        if (this._layout[y][x] !== value) {
            return [];
        }

        if (tiles.find(tile => tile.x === x && tile.y === y)) {
            return [];
        }

        tiles.push({ x, y });

        for (let y2 = -1; y2 <= 1; y2++) {
            for (let x2 = -1; x2 <= 1; x2++) {
                if (Math.abs(x2) + Math.abs(y2) !== 1) {
                    continue;
                }
                this.#floodfill(tiles, x+x2, y+y2, value);
            }
        }

        return tiles;
    }

    /**
     * @param {number[][]} layout 
     * @returns number[][]
     */
    #getLayoutToBackground(layout) {
        let walls = [];

        for (let y = 0; y < layout.length; y++) {
            let row = [];
            for (let x = 0; x < layout[y].length; x++) {
                let value = -1;
                switch (layout[y][x]) {
                    case 0:
                        value = 93;
                        break;
                    case 1:
                        value = Phaser.Math.Between(1, 2) === 2 ? 131 : 85;
                        if (y+1 >= layout.length || (y+1 < layout.length && layout[y+1][x] === 0)) {
                            value = Phaser.Math.Between(1, 2) === 2 ? 108 : 62;
                        }
                        break;
                }
                row.push(value);
            }
            walls.push(row);
        }

        return walls;
    }

    /**
     * @param {number[][]} layout 
     * @returns number[][]
     */
    #getLayoutToShadow(layout) {
        let walls = [];

        for (let y = 0; y < layout.length; y++) {
            let row = [];
            for (let x = 0; x < layout[y].length; x++) {
                let value = -1;
                switch (layout[y][x]) {
                    case 0:
                        if (y > 0) {
                            if (layout[y-1][x] === 1) {
                                value = 100;
                            }
                        }
                        break;
                    case 2:
                        if (y > 0) {
                            let tiles = [];
                            this.#floodfill(tiles, x, y, 2);
                            if (tiles.length > 1 && layout[y-1][x] !== 2) {
                                value = 100;
                            }
                        }
                        break;
                }
                row.push(value);
            }
            walls.push(row);
        }

        return walls;
    }

    /**
     * @param {number} width
     * @param {number} height
     * returns {number[][]}
     */
    #generateLayout(width, height) {
        let layout = [];

        // Generate a layout with all walls
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                row.push(Phaser.Math.Between(0, 100) <= 45 ? 1 : 0);
            }
            layout.push(row);
        }

        // https://www.roguebasin.com/index.php?title=Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
        let iteration = 4;

        for (let i=0; i<iteration; i++) {
            let newLayout = [];
            for (let y = 0; y < layout.length; y++) {
                let row = [];
                for (let x = 0; x < layout[y].length; x++) {
                    let count = 0;
                    for (let y1 = -1; y1 <= 1; y1++) {
                        for (let x1 = -1; x1 <= 1; x1++) {
                            if (y + y1 < 0 || y + y1 >= layout.length || x + x1 < 0 || x + x1 >= layout[y].length) {
                                count+=2;
                                continue;
                            }
                            if (layout[y + y1][x + x1] === 1) {
                                count++;
                            }
                        }
                    }

                    let countNearby = 0;
                    let distance = 2;
                    for (let y1 = -distance; y1 <= distance; y1++) {
                        for (let x1 = -distance; x1 <= distance; x1++) {
                            if (y + y1 < 0 || y + y1 >= layout.length || x + x1 < 0 || x + x1 >= layout[y].length) {
                                continue;
                            }
                            if(Math.abs(x1 - x) == 2 && Math.abs(y1 - y) == distance) {
                                continue;
                            }
                            if (layout[y + y1][x + x1] === 1) {
                                countNearby++;
                            }
                        }
                    }

                    if ((layout[y][x] === 1 && count > 5) || (layout[y][x] === 0 && count >= 5) || (layout[y][x] === 0 && countNearby <= 3)) {
                        row.push(1);
                    } else {
                        row.push(0);
                    }
                }
                newLayout.push(row);
            }

            layout = newLayout;
        }

        return layout;
    }
}
