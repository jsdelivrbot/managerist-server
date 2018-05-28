import {User} from "./user";
export enum GameStarterBonus{Angel, Programmer, Analytic, Sales};
export enum GameDifficulty{Dumb, Easy, Normal, Hard, DieHard};

export class GameOptions {
    autoAssign:boolean = true;
    autoManageProjects:boolean = true;
    speed: number = 4;
    turnMode: boolean = true;
}

export class Game {
    _id: any;
    setup: any;
    name: string = '';
    users: any[] = [];
    options: GameOptions = new GameOptions;
    startDate: number = (new Date()).getTime();
    lastInteraction: number = (new Date()).getTime();

    // Mode, game speed may change, so this is a "current-state" date that is updated on each turn/tick
    simulationDate: number = (new Date()).getTime();

    // Refs
    creator: User = new User();
}
