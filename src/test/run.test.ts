import {Managerist} from "../app";
import { ConfigLoader } from "../app.config.loader";

export var run = () => {
    var Config = new ConfigLoader("../config"), 
        TestConfig = new ConfigLoader("../config.env.test", true),
        conf = Config.override(TestConfig.Config).Config;

    new Managerist(conf.server.port, conf);
}