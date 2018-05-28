import {Managerist} from "../app";
import * as Config from "../config";
import * as TestConfig from "../config.env.test";


var config = Object.assign(Config, TestConfig);
export var run = () => {
    new Managerist(config.server.port, config);
}