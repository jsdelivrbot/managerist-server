import {chai, assert, Storage} from "./test.commons"
import {Managerist} from "../app";

// Should initiate test-app for us
import * as testApp from "./run.test"
import {Game} from "../models/game";
import { ISuiteCallbackContext } from "mocha";

var cleanupDb = ():Promise<any> => {
    let gmConnName:string = Managerist.getGameConnection(Storage.get('gameId')),
        gamesList:any[] = [];

    return Managerist.db.connections['main'].
            collection('users').drop()
            .then(() => {
                console.log('\x1B[33mUsers dropped in `main` DB\x1B[0m');
                return (new Game()).findAll();
            })
            .then((gl:any) => gamesList = gl.map((g:any) => g._id))
            .then(() => Managerist.db.connections['main'].collection('games').drop())
            .then(() => console.log('\x1B[33mGames dropped in `main` DB\x1B[0m'))
            .then(() =>
                Promise.all(
                    gamesList.map((g) =>
                        Managerist.db.connections[Managerist.newGameConnection(g)].dropDatabase()
                    )
                )
            )
            .then(() => console.log('\x1B[33mDBs dropped:', gamesList, "\x1B[0m"))
            .catch((e: Error) => console.log('\x1B31mCleanup Failed:', e.message, "\x1B[0m"));
};

describe('App test', () => {
    before(() => testApp.run());

    require('./_core/init');
    require('./user/register');
    // Create Game with "Angel" setup
    require('./game/game.basics');

    // Check that Company created, and have correct financials data
    require('./company/company.basics');
    // Check that Employee was created correctly
    require('./employee/employee.startup');

// GAME LOGICS
    require('./game/departments/production');
    require('./game/departments/marketing');

    require('./game/scenario/hire.developer');
    require('./game/scenario/fire.developers');
    require('./game/scenario/hragency');
    require('./game/scenario/estimate.project');
    require('./game/scenario/burnout');
    require('./game/scenario/hire.sales');
//    require('./game/scenario/upgrade.product');

    //require('./game/game.delete');

    after(() => {
        //Promise.resolve(true)
        cleanupDb()
            .then(() => {
                Managerist.app.stop(() => console.log('\x1B[33mServer is closed!\x1B[0m'))
            });
    });
});


