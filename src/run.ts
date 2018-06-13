import {Managerist} from "./app";
var Config;
try {
    Config = require("./config");
} catch(e) {
    Config = process.env.MANAGERIST_CONF || {};
}

new Managerist(Config.server.port, Config);