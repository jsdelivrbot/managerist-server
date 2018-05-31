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
                console.log('Users dropped in `main` DB');
                return (new Game()).findAll();
            })
            .then((gl:any) => gamesList = gl.map((g:any) => g._id))
            .then(() => Managerist.db.connections['main'].collection('games').drop())
            .then(() => console.log('Games dropped in `main` DB'))
            .then(() =>
                Promise.all(
                    gamesList.map((g) =>
                        Managerist.db.connections[Managerist.newGameConnection(g)].dropDatabase()
                    )
                )
            )
            .then(() => console.log('DBs dropped:', gamesList))
            .catch((e: Error) => console.log('Cleanup Failed:', e.message));
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

//  require('./game/first.steps');


    require('./game/scenario/hire.developer');
    require('./game/scenario/estimate.project');
    require('./game/scenario/burnout');
    require('./game/scenario/upgrade.product');

    //require('./game/game.delete');

    after(() => {
        //Promise.resolve(true)
        cleanupDb()
            .then(() => {
                Managerist.app.stop(() => console.log('Server is closed!'))
            });
    });
});


