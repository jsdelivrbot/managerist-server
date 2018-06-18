import {Managerist} from "./app";
import { ConfigLoader } from "./app.config.loader";

var Config = (new ConfigLoader("./config")).Config;
new Managerist(Config.server.port, Config);