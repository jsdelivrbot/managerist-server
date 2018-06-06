import { LogLevel } from "..";
import { LogDriver } from "../driver";
import { Utils } from "../../utils";

export class Nop extends LogDriver {
    /**
     * 
     * @param message 
     * @param level 
     * @param options 
     */
    public log(message:any, level:LogLevel = LogLevel.Info, options = {}) {
        return true;
    }
}