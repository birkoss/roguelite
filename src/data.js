import Phaser from './lib/phaser.js';

import { DATA_ASSET_KEYS } from './keys/asset.js';

export class Data {
    /**
     * @param {Phaser.Scene} scene 
     * @param {string} unitId  
     */
    static getUnitDetails(scene, unitId) {
        /** @type {UnitDetails[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.UNIT);

        return data.find((unit) => unit.id === unitId);
    }
}
