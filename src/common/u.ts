var FeatureNameGenerator = require('feature-name-generator');

export class U {
    static format$(num: number):string {
        let sign: boolean = num < 0,
            val = Math.abs(num),
            b = Math.floor(val / 1000000000.0),
            m = Math.floor((val - b*1000000000)/ 1000000),
            k = (val - b*1000000000 - m * 1000000)/1000;

        return (sign ? '-':'') + (b >= 1 ? b + 'B ' : '') + (m >= 1 ? m + 'M ' : '') + (k ? k + 'k ' : '') + '$';
    }

    static randomColor = (base:number = 0):string =>
        "rgb(" + ['','',''].map(() => base + Math.round(Math.random() * (255 - base))).join() + ')';

    static randomName():string {
        let n = String.fromCharCode(65 + Math.round(Math.random()*25));
        for(let i=0; i< 3+Math.random()*8; i++) {
            n += String.fromCharCode(97 + Math.round(Math.random()*25))
        }
        return U.capitaize(n);
    }

    static capitaize = (s:string):string => s[0].toUpperCase() + s.slice(1);

    static personName = ():string => U.randomName() + ' ' + U.randomName();

    static featureName = ():string => FeatureNameGenerator.generate().spaced;

    /**
     * a
     *
     * return array of "cnt" filled with "-"
     * @todo rename to strpad
     * @param cnt
     */
    static a = (cnt:number):any[] => Array.from('-'.repeat(cnt));

    static e = (_enum:any, val:any):string => Number.isNaN(+val) ? _enum[_enum[val]] : _enum[val];
    static el = (_enum:any):string[] => Object.getOwnPropertyNames(_enum).filter((v:any) => Number.isNaN(+v));
    static en = (_enum:any, val:any):number => Number.isNaN(+val) ? _enum[val] : _enum[_enum[val]];
    static enl = (_enum:any):number[] => Object.getOwnPropertyNames(_enum).map((v:string) => _enum[v]).filter((v:any) => !Number.isNaN(+v));

    static sum = (_arr:number[]):number => _arr.length ? _arr.slice(0).reduce((a:number, b:number) => a+b, 0)/(_arr.length) : 0;
    static big3 = (_arr:number[]):number[] => _arr.slice(0).sort((a,b) => a < b).slice(0, 3);
    static big3o = (_arr:any[], prop:string):any[] => _arr.slice(0).sort((a,b) => a[prop] < b[prop]).slice(0, 3)
}
