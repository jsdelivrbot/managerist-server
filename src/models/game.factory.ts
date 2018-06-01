import {Game, GameActivity, GameOptions, GameStarterBonus, GameDifficulty} from "./game";
import {Company, CompanySize} from "./company";
import {Product} from "./product";
import {Role} from "./role";
import {ExpertiseLevel} from "./technology";
import {Employee} from "./employee";
import {HireActionType} from "./actions/types/hire.actiontype";
import {ProductFactory} from './product/product.factory';
import {AudienceFactory} from "./audience/audience.factory";
import {EmployeeFactory} from "./employee/employee.factory";
import {U} from "../common/u";

/**
 * Class GameSetup
 *
 * all possible settings with what game can be started
 */
export class GameSetup {
    starterBonus: string;
    difficulty: string;
    companySize: string;
    companyName: string;
    constructor(sb:any|GameStarterBonus = {}, nm?:string, d:GameDifficulty = GameDifficulty.Easy, sz:CompanySize = CompanySize.Startup) {
        if (!nm && typeof sb == 'object') {
            this.starterBonus = sb.starterBonus;
            this.difficulty = sb.difficulty;
            this.companySize = sb.companySize;
            this.companyName = sb.companyName;
        }

        if (nm) {
            this.starterBonus = (isNaN(sb) ? sb : GameStarterBonus[sb]) as string;
            this.difficulty = (isNaN(d) ? d : GameDifficulty[d]) as string;
            this.companySize = (isNaN(sz) ? sz : CompanySize[sz]) as string;
            this.companyName = nm;
        }
    }

    get():Object {
        let res:any = {};
        for(let k of Object.getOwnPropertyNames(this))
            res[k] = (<any>this)[k];
        return res;
    }
}

/**
 * Class GameFactory
 */
export class GameFactory {
    private _game:Game;
    private _company:Company;

    generate(userId:any, setup: GameSetup): Promise<Game> {
        // TODO ~ validate, require name
        setup.companyName = setup.companyName || U.randomName();

        // TODO add perks for "Premium" users
        // MVP ~ only Startup supporter (other may be loaded)
        if (setup.companySize != CompanySize[CompanySize.Startup])
            return Promise.reject('Only "Startup" (u gave~'+setup.companySize+') implemented so far, sawwy :(');

        let t = (new Date).getTime(),
            simulationDate = new Date(t),
            tsetup:any = setup.get();
        simulationDate.setMonth(0);
        simulationDate.setDate(1);
        simulationDate.setSeconds(0,0);
        delete tsetup.companyName;

        this._game = <Game>((new Game)
            .populate({
                setup: tsetup,
                options: (new GameOptions).list,
                startDate: simulationDate,
                lastInteraction: t,
                simulationDate: simulationDate,
                creator: userId,
                users: [userId],
                name: setup.companyName
            }));
        return this._game
            .save()
            .then(() => {
                return (new Company(new GameActivity(userId, this._game._id, t), {
                    user: userId,
                    name: setup.companyName,
                    funds: setup.starterBonus == GameStarterBonus[GameStarterBonus.Angel]
                        ? 10000
                        : 0
                }))
                    .save()
            })
            .then((c:Company) => this._company = c)
            .then((c:Company) => {
                return (new ProductFactory(this._company)).generate()
                    .then((p:Product|any) => {
                        return (new AudienceFactory(this._company)).generate(p);
                    })
                    .catch((e:Error) => Promise.reject('Product generator down: '+ e.toString()));
            })
            .then(() => {
                let roleName = 'Accountant',
                    level = ExpertiseLevel.Senior,
                    bonus = (<any>GameStarterBonus)[setup.starterBonus];
                if (bonus == GameStarterBonus.Angel) {
                    roleName = 'Accountant';
                    level = ExpertiseLevel.Junior;
                } else if (bonus == GameStarterBonus.Programmer) {
                    roleName = 'Accountant';
                    level = ExpertiseLevel.Junior;
                } else if (bonus == GameStarterBonus.Sales) {
                    roleName = 'Sale';
                } else if (bonus == GameStarterBonus.Analytic) {
                    roleName = 'BA';
                } else {
                    return Promise.reject('Unknown "Starter Bonus"~"' + setup.starterBonus +'"');
                }
                return new Role().find({name: roleName})
                    .then((r:Role|any) => {
                        if (level == ExpertiseLevel.Junior)
                            r.trait.n -= 2;
                        else if (level == ExpertiseLevel.Senior)
                            r.trait.n += 5;
                        return r;
                    })
                    .then((r:Role) => (new EmployeeFactory(this._company.ga)).generate(r, level))
                    .then((e:Employee|any) => {
                        if (!e) return e;
                        return (new HireActionType(e.ga)).do({
                            date: t,
                            company: this._company._id,
                            employee: e._id,
                        });
                    })
                    .catch((e:Error) => Promise.reject(e.toString()));
            })
            .then(() => this._game)
            .catch((e:Error) => {
                throw new Error('Somwhere chain is broken: '+ e.toString())
            });
    }
}