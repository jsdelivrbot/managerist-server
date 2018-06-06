export class Utils {
    static randomColor = (base:number = 0):string =>
        "rgb(" + ['','',''].map(() => base + Math.round(Math.random() * (255 - base))).join() + ')';

    static capitaize = (s:string):string => s[0].toUpperCase() + s.slice(1);

    static e = (_enum:any, val:any):string => Number.isNaN(+val) ? _enum[_enum[val]] : _enum[val];
    static el = (_enum:any):string[] => Object.getOwnPropertyNames(_enum).filter((v:any) => Number.isNaN(+v));
    static en = (_enum:any, val:any):number => Number.isNaN(+val) ? _enum[val] : _enum[_enum[val]];
    static enl = (_enum:any):number[] => Object.getOwnPropertyNames(_enum).map((v:string) => _enum[v]).filter((v:any) => !Number.isNaN(+v));

    static sum = (_arr:number[]):number => _arr.length ? _arr.slice(0).reduce((a:number, b:number) => a+b, 0) : 0;
    static sumo = (_arr:any[], prop:string):number => Utils.sum(_arr.map((a) => a[prop]));
    static avg = (_arr:number[]):number => _arr.length ? Utils.sum(_arr)/_arr.length : 0;
    static big3 = (_arr:number[]):number[] => _arr.slice(0).sort((a,b) => b - a).slice(0, 3);
    static big3o = (_arr:any[], prop:string):any[] => _arr.slice(0).sort((a,b) => b[prop]- a[prop]).slice(0, 3);
    static dstr = (n:number):number[] => [...new Array(n)].reduce((a,_,i) => a[1].push(-a[0]+(a[0]+=(1 - a[0])*(n-i < 2 ? 1 : Math.random()))) && a, [0,[]])[1];
}