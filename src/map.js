import Phaser from './lib/phaser.js';

import { DUNGEON_ASSET_KEYS } from './keys/asset.js';

export class Map {
    _layout;
    _tilemap;
    _layerBackground;
    _layerShadow;

    /**
     * @param {Phaser.Scene} scene */
    constructor(scene) {
        this._scene = scene;

        this._layout = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];

        this._layout = this.#generateLayout(20, 40);

        this._tilemap = this._scene.make.tilemap({
            tileWidth: 36,
            tileHeight: 36,
            width: this._layout[0].length,
            height: this._layout.length,
        });
        const tileset = this._tilemap.addTilesetImage(DUNGEON_ASSET_KEYS.DUNGEON, null, 36, 36);

        this._layerBackground = this._tilemap.createBlankLayer("BACKGROUND", tileset);
        this._layerBackground.putTilesAt(this.#getLayoutToBackground(this._layout), 0, 0);

        this._layerShadow = this._tilemap.createBlankLayer("SHADOW", tileset);
        this._layerShadow.putTilesAt(this.#getLayoutToShadow(this._layout), 0, 0);

        // this._layerBackground.setScale(0.5);
        // this._layerShadow.setScale(0.5);
    }

    /** @type {Number} */
    get width() {
        return this._tilemap.width;
    }

    /** @type {Number} */
    get height() {
        return this._tilemap.height;
    }

    get layout() {
        return this._layout;
    }

    getTileAtWorldXY(worldX, worldY) {
        return this._tilemap.getTileAtWorldXY(worldX, worldY, false, this._scene.cameras.main, this._layerBackground);
    }

    worldToTileX(worldX) {
        return this._tilemap.worldToTileX(worldX);
    }

    worldToTileY(worldY) { 
        return this._tilemap.worldToTileY(worldY);
    }

    getTileAt(x, y) {
        return this._tilemap.getTileAt(x, y, false, this._layerBackground);
    }

    getTiles() {
        return this._layerBackground.getTilesWithin();
    }

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
                }
                row.push(value);
            }
            walls.push(row);
        }

        return walls;
    }

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
        let loop = 4;
        console.log("layout");
        console.log(layout);
        for (let i=0; i<loop; i++) {
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

            console.log("newLayout");
            console.log(newLayout);
            layout = newLayout;
        }

        return layout;

        // Dig holes in the layout
        let tilesToRemove = ((width*height) * .5) - width*2 - height*2;

        let walkerPosition = {x: Math.floor(width/2), y: Math.floor(height/2)};

        const directions = [
            {x: 0, y: -1},
            {x: 0, y: 1},
            {x: -1, y: 0},
            {x: 1, y: 0},
        ];

        while (tilesToRemove > 0) {
            var randomDirection = directions[Phaser.Math.Between(0, directions.length-1)];
            
            let newWalkerPosition = {x: walkerPosition.x + randomDirection.x, y: walkerPosition.y + randomDirection.y};

            if (newWalkerPosition.x < 1 || newWalkerPosition.x >= width - 1 || newWalkerPosition.y < 1 || newWalkerPosition.y >= height - 1) {
                continue;
            }

            if (layout[newWalkerPosition.y][newWalkerPosition.x] === 1) {
                layout[newWalkerPosition.y][newWalkerPosition.x] = 0;
                tilesToRemove--;
            }

            walkerPosition = newWalkerPosition;
        }

        // Shrink the layout
        let removeY = [];
        let removeX = [];

        for (let y = 0; y < layout.length; y++) {
            if ( y === 0 || y === layout.length - 1) {
                continue;
            }
            let filled = 0;
            for (let x = 0; x < layout[y].length; x++) {
               if (layout[y][x] === 1) {
                   filled++;
               }
            }
            if (filled === layout[y].length) {
                removeY.push(y);
            }
        }

        for (let x = 0; x < layout[0].length; x++) {
            if ( x === 0 || x === layout[0].length - 1) {
                continue;
            }
            let filled = 0;
            for (let y = 0; y < layout.length; y++) {
                if (layout[y][x] === 1) {
                    filled++;
                }
                if (filled === layout.length) {
                    removeX.push(x);
                }
            }
        }

        let shrinkedLayout = [];
        for (let y = 0; y < layout.length; y++) {
            if (removeY.includes(y)) {
                continue;
            }
            let row = [];
            for (let x = 0; x < layout[y].length; x++) {
                if (removeX.includes(x)) {
                    continue;
                }
                row.push(layout[y][x]);
            }
            shrinkedLayout.push(row);
        }
        
        return shrinkedLayout;
    }
}
