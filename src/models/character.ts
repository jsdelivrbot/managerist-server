import {Character as CharacterCommon, BasicProperty} from "../common/models/character"
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
        let params:any[] = [],
            sign:boolean = n>0;
        for (let bp in BasicProperty)
            if (Number.isNaN(+bp))
                params.push((<any>this)[bp]);
        if (params.length <= fixed.length)
            return this;

        for(let i=0; i<Math.abs(n);i++) {
            let p:number = Math.floor(params.length * Math.random());

            // Skip fixed and max values
            while(
            fixed.indexOf(params[p]) !== -1 || fixed.indexOf(p) !== -1
            || (sign && (<any>this)[params[p]] >= 0.999 && ['Intelligence', 'Communication'].indexOf(params[p]) == -1)
            || (!sign && (<any>this)[params[p]] <= 0.1)
                )
                p = (p+1) % params.length;

            (<any>this)[params[p]] = (<any>this)[params[p]] + (sign ? 0.1 : -0.1);
        }
        return this;
    };
}