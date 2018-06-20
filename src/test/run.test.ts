import {Managerist} from "../app";
import { ConfigLoader } from "../app.config.loader";

export var run = () => {
    var Config = (new ConfigLoader("../config")).Config, 
        TestConfig = (new ConfigLoader("../config.env.test")).Config;

    Config = Object.assign(Config, TestConfig);
    new Managerist(Config.server.port, Config);
}