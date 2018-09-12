import {Character as CharacterCommon, BasicProperty} from "../common/models/character"
import { U } from "../common";
export {BasicProperty}  from "../common/models/character"

/**
 * Class Character
 *
 * Define personal traits
 */
export class Character extends CharacterCommon {

    /**
     * updateRandom
     *
     *  Set base params, diviate on 0.1 * n for random base-params
     *
     * @param n number
     * @param fixed BasicProperty[]
     */
    updateRandom = (n:number, fixed: BasicProperty[] = []) => {
        let bpList = U.el(BasicProperty),
            sign:boolean = n>this.n;
        
        bpList = bpList.filter(bp => !fixed.includes(U.en(BasicProperty, bp)));
        
        if (!bpList.length) return this;

        n-=this.n;
        while (n!=0 && bpList.length) {
            let p:string = bpList[Math.floor(bpList.length * Math.random())];

            if (sign && this[p] >= Character.maxValues[p]) {
                bpList = bpList.filter(bp => bp != p);
                continue;
            }
            if (!sign && this[p] <= 0.1) {
                bpList = bpList.filter(bp => bp != p);
                continue;
            }

            this[p] = this[p] + (sign ? 0.1 : -0.1);
            n+= sign ? -1 : 1;
        }
        return this;
    };
}