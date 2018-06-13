import {Managerist} from "../app";
var Config, TestConfig;
try {
    Config = require("../config");
}
catch (e) {
    Config = process.env.MANAGERIST_CONF || {};
}
try {
    TestConfig = require("../config.env.test");
}
catch (e) {
    TestConfig = process.env.MANAGERIST_TEST_CONF || {};
}

var config = Object.assign(Config, TestConfig);
export var run = () => {
    new Managerist(config.server.port, config);
}