import { Project } from '../models/project';
import { CrudGameController } from './crud.game.controller';

export class ProjectController extends  CrudGameController {
    _activeRecordClass = Project;

    public actionPost = (req: any, res: any, next: any):Promise<any> => {
        /** @TODO: if not sandbox */
        return Promise.resolve(
            res.status(403).send('Can\'t be changed directly, only through the game actions')
        );
    }

    public actionDelete = (req: any, res: any, next: any):Promise<any> => {
        /** @TODO: if not sandbox */
        return Promise.resolve(
            res.status(403).send('Can\'t be changed directly, only through the game actions')
        );
    }
}