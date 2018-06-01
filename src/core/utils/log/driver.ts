import { LogLevel } from ".";

export abstract class LogDriver {
    constructor(protected _options:any = {}) {}
    public abstract log(message:any, level?:LogLevel, options?:any):boolean;
}