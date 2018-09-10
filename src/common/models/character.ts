export enum BasicProperty{Intelligence/*IQ*/, Communication/*EQ*/, Focusing, Leadership, Appearance, Trustworthy};

/**
 * Class Character
 *
 * Define personal traits
 */
export class Character {
    public Intelligence:number = 1;// |Character|any/*IQ*/ = 1, // ~1
    public Communication:number/*EQ*/ = 0.8; // ~  0.8
    public Focusing:number = 0.5;  // 0 - 1
    public Leadership:number = 0.2; // 0 - 1
    public Appearance:number = 0.5; // 0 - 1
    public Trustworthy:number = 0.5; // 0 - 1
    
    private static _maxValues = {
        [BasicProperty.Intelligence] : 2,
        [BasicProperty.Communication] : 1.5,
        [BasicProperty.Focusing] : 1,
        [BasicProperty.Leadership] : 1,
        [BasicProperty.Appearance] : 1,
        [BasicProperty.Trustworthy] : 1,
    };
    static get maxValues() {
        return Character._maxValues;
    }
    
    private static _n = 35; // Default starting summ of params
    static get defaultN() {
        return Character._n;
    }
    constructor(obj:any = null) {
        for (let bp in BasicProperty)
            if (Number.isNaN(+bp) && (<any>obj)[bp])
                (<any>this)[bp] = (<any>obj)[bp];
    }

    get n():number {
        return 10 * (
                (this.Intelligence) + this.Communication + this.Focusing + this.Leadership + this.Appearance + this.Trustworthy
        );
    }

    set list(obj:any) {
        for (let bp of obj)
            (<any>this)[bp] = obj[bp];
    }

    get list():any {
        let res:any = {};
        for (let bp in BasicProperty)
            if (Number.isNaN(+bp))
                res[bp] = (<any>this)[bp];

        return res;
    }

    /**
     *  normalized (all values 0-1) list
     */
    get nList() {
        let res:any = {};
        for (let bp in BasicProperty)
            if (Number.isNaN(+bp))
                res[bp] = (<any>this)[bp] / Character.maxValues[BasicProperty[bp]];

        return res;
    }    
}