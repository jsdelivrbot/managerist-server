import { LogLevel } from "..";
import { LogDriver } from "../driver";
import { Utils } from "../../utils";

export class Console extends LogDriver {
    /**
     * 
     * @param message 
     * @param level 
     * @param options 
     */
    public log(message:any, level:LogLevel = LogLevel.Info, options = {}) {
        if (1) return true;
        if (!(message instanceof Error)) {
            if (typeof message != 'string')
                message = JSON.stringify(message);
            
            message = this._colorize(message, level, options);
        }
        if (LogLevel.Error == level)
            console.error(message);
        else
            console.log(message);
        return true;
    }

    /**
     * 
     * @todo take a look at https://www.npmjs.com/package/colors
     * full color list may be found: https://stackoverflow.com/a/50325607/1192115
     * 
     * @param message 
     * @param level 
     * @param options 
     */
    protected _colorize(message, level?:LogLevel, options?:any) {
        let color = 0;
        if (options && options.color) {
            switch (options.color) {
                case 'blue': color=34; break;
                case 'purple': color=35; break;
                case 'cyan': color=36; break;
                case 'green': color=32; break;
                case 'yellow': color=33; break;
                case 'red': color = 31; break;
                case 'grey': color = 37; break;
                case 'dark': color = 2; break;
            }
        } else if (level) {
            switch (Utils.en(LogLevel, level)) {
                case LogLevel.Debug: color=2; break;
                case LogLevel.Info: color=36; break;
                case LogLevel.Warning: color=33; break;
                case LogLevel.Error: color=31; break;
            }
        }
        return "\x1b["+color+"m" + message + "\x1b[0m";
    }
}