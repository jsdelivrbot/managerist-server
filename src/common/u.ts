import { Utils } from "../core/utils/utils";

var PrjNameGenerator = require('project-name-generator');
var NodeRandomName = require('node-random-name');

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

    static randomName(nmax:number = 12):string {
        let vow = "euioa",
            cons = "qwrtpsdfghklzxcvbnm",
            semi = "yj",
            all = [...vow, ...cons, ...semi],
            l = Math.max(3, Math.random()*nmax),
            rc = (arr) => arr[Math.floor(Math.random()*arr.length)],
            rules = [
                [(_n, c) => (_n && [..._n.slice(-2), c].reduce((a, b) => (vow.includes(b) && a), 1)), rc(cons)],
                [(_n, c) => (_n && [..._n.slice(-2), c].reduce((a, b) => (cons.includes(b) && a), 1)), rc(vow)],
                [(_n, c) => (_n && semi.includes(_n.slice(-1)) && semi.includes(c)), rc([...vow, ...cons])],
                [(_n, c) => (_n && [..._n.slice(-2), c].reduce((a,b) => ([...semi, ...cons].includes(b) && a),1)), rc(vow)],
            ],
            n = "";
        for (let i = 0; i < l; i++) 
            n += rules.reduce((a, b) => (b[0](n, a) && b[1]) || a, rc(all));
        
        return U.capitaize(n);
    }
    static personName_ = ():string => U.randomName(8) + ' ' + U.randomName();
    static personName = (m = true): string => NodeRandomName({ gender: m ? "male" : "female" });
    static featureName = ():string => PrjNameGenerator.generate().spaced;
    static projectName = ():string => PrjNameGenerator.generate({words: 1}).spaced;
}