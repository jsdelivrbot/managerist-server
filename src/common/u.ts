import { Utils } from "../core/utils/utils";

var FeatureNameGenerator = require('feature-name-generator');

export class U extends Utils {
    static format$(num: number):string {
        let sign: boolean = num < 0,
            val = Math.abs(num),
            b = Math.floor(val / 1000000000.0),
            m = Math.floor((val - b*1000000000)/ 1000000),
            k = (val - b*1000000000 - m * 1000000)/1000;

        return (sign ? '-':'') + (b >= 1 ? b + 'B ' : '') + (m >= 1 ? m + 'M ' : '') + (k ? k + 'k ' : '') + '$';
    }
    /**
     * a
     *
     * return array of "cnt" filled with "-"
     * @todo rename to strpad
     * @param cnt
     */
    static a = (cnt:number):any[] => Array.from('-'.repeat(cnt));

    static randomName():string {
        let n = String.fromCharCode(65 + Math.round(Math.random()*25));
        for(let i=0; i< 3+Math.random()*8; i++) {
            n += String.fromCharCode(97 + Math.round(Math.random()*25))
        }
        return U.capitaize(n);
    }
    static personName = ():string => U.randomName() + ' ' + U.randomName();
    static featureName = ():string => FeatureNameGenerator.generate().spaced;
}
