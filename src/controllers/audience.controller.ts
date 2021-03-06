import { CrudGameController } from './crud.game.controller';
import { Audience } from '../models/audience';
import { ActiveRecord, MongoTypes } from '../core/db/active.record';
import { AudienceHistory } from '../models/audience/audience.history';

export class AudienceController extends  CrudGameController {
    _activeRecordClass = Audience;
    constructor(app:any) {
        super(app, [
            {
                route: '/history/:id/:from*',
                method: 'get',
                handler: 'actionHistory'
            }
        ]);
    }

    public actionHistory = (req: any, res: any, next: any):Promise<any> => {
        if (!req.params.id) return res.status(500).send('Audience ID not passed');

        let filter:any = {
            audience: MongoTypes.ObjectId(req.params.id)
        };
        if (req.params.from)
            filter.date = {$gt: (new Date(req.params.from)).getTime()};

        return  (new AudienceHistory((<Audience>this.ar).ga))
            .findAll(filter)
            .then((data: ActiveRecord[]) => {
                res.json(data.map(d => d.common));
            })
            .catch((err:any) => res.status(500).send(err));
    }
    
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
