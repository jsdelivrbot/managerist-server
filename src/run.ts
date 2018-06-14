import {Managerist} from "./app";
import { ConfigLoader } from "./core/config.loader";

var Config = (new ConfigLoader("./config")).Config;
new Managerist(Config.server.port, Config);