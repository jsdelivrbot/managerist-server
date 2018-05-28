export enum BasicProperty{Intelligence/*IQ*/, Communication/*EQ*/, Focusing, Leadership, Appearance, Trustworthy};

/**
 * Class Character
 *
 * Define personal traits
 */
export class Character {
    private static _n = 35; // Default starting summ of params
    static get defaultN() {
        return Character._n;
    }
    constructor(
        public Intelligence:number = 1,// |Character|any/*IQ*/ = 1, // ~1
        public Communication:number/*EQ*/ = 0.8, // ~  0.8
        public Focusing:number = 0.5,  // 0 - 1
        public Leadership:number = 0.2, // 0 - 1
        public Appearance:number = 0.5, // 0 - 1
        public Trustworthy:number = 0.5 // 0 - 1
    ) {
        if (Number.isNaN(<any>Intelligence))
            for(let p of Object.getOwnPropertyNames(Intelligence))
                (<any>this)[p] = (<any>Intelligence)[p];
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
}