import {Managerist} from "../app";
import { ConfigLoader } from "../app.config.loader";

export var run = () => {
    var Config = new ConfigLoader("../config"); 
    var TestConfig = {Config: {}};//new ConfigLoader("../config.env.test", true);
    var conf = Config.override(TestConfig.Config).Config;

    new Managerist(conf.server.port, conf);
}