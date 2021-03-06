import {LogDriver} from './driver'
import * as Drivers from './drivers'
import { Mean } from '../../mean';
import { Utils } from '../utils';

export enum LogLevel {Debug, Info, Warning, Error};
export class Log {
    private static _logDriverInstance:LogDriver = null;
    private static _instantiate() {
        let drv:LogDriver;

        if (!Log._logDriverInstance) {
            let confLogDriver:any = Mean.config.log || {driver: 'console'},
                logClass:any = Utils.capitaize(confLogDriver.driver);
            try {
                drv = new confLogDriver.driver(confLogDriver);
            } catch(e) {
                drv = new Drivers[logClass](confLogDriver);
            }
        }
        if (Mean.config.log)
            Log._logDriverInstance = drv;
        return Log._logDriverInstance || drv;
    }
    private static get _log() { return Log._logDriverInstance || Log._instantiate();}
    
    /**
     * 
     * @param message 
     * @param level 
     * @param options 
     * @returns boolean
     */
    static log(message:any, level:LogLevel = LogLevel.Info, options?:any) {
        return Log._log.log(message, level, options);
    }
}