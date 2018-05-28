import {ActiveRecord, ActiveRecordInterface} from "../core/db/active.record";
import {BaseGameController} from "./base.game.controller";
import {GameBasedInterface} from "../models/game.based";

export abstract class CrudGameController extends BaseGameController {
    protected _activeRecordClass: GameBasedInterface;

    get activeRecordClass() {
        return this._activeRecordClass;
    }

    /**
     *
     * @param req
     * @return {boolean}
     */
    protected requestCheck(req:any) {
        super.requestCheck(req);
        console.log("CRUD GAME CTRL CHECK: ", this.currentGame);

        return !!this.currentGame;
    };

    protected get ar():ActiveRecord {
        return (new  this.activeRecordClass(this.ga));
    }
    constructor(app:any, routes?: {route:string, method:string, handler:string}[]) {
        super(app, routes);

        this._addHandler('get', this.baseRoute + '/list/:search*?', 'actionList');

        /**
         * Create / Update entity
         * @database
         */
        this._addHandler('post', this.baseRoute, 'actionPost');

        /**
         * Delete name.
         * @database
         */
        this._addHandler('delete', this.baseRoute + '/:id*?', 'actionDelete');

        /**
         * Get single. ~ should be Lowest priority
         * @database
         */
        this._addHandler('get', this.baseRoute + '/:id', 'actionGet');
    }

    public actionGet = (req: any, res: any, next: any):Promise<any> => {
        console.log('\u001B[35m GET action\u001B[0m');
        let withParam = req.query.with || [];
        //req.query.with && delete(req.query.with);

        return this.ar
            .withRelations(withParam)
            .findById(req.params.id)
            .then((ar:ActiveRecord|null) => {
                if (!ar)
                    return res.statusCode = 404;
                return res.json(ar.common);
            })
            .catch((err:any) => res.status(500).send(err));
    }

    public actionList = (req: any, res: any, next: any):Promise<any> => {
        let filter = req.params.search
                ? {name: new RegExp(req.params.search, 'i')}
                : req.query,
            withParam = req.query.with || [];
        req.query.with && delete(req.query.with);

        return this.ar
            .withRelations(withParam)
            .findAll(filter)
            .then((data:ActiveRecord[]) => {
                res.json(data.map(d => d.common));
            })
            .catch((err:any) => res.status(500).send(err));
    }

    public actionPost = (req: any, res: any, next: any):Promise<any> => {
        return (<Promise<ActiveRecord>>(req.body._id
                ? this.ar.findById(req.body._id)
                : Promise.resolve(this.ar)
        )).then((ar:ActiveRecord) => {
            console.log("NEW AR:", ar.common);
            console.log("BODY:", req.body);
            ar.populate(req.body)
                .save()
                .then(() => res.json({success: true, id: ar._id}))
                .catch((err:any) => res.status(500).send(err));
        });
    }

    public actionDelete = (req: any, res: any, next: any):Promise<any> => {
        let id = req.params.id || req.body.id;
        if (!id)
            return res.status(404).send('ID required');

        return this.ar.delete(id)
            .then((ret:boolean) => {
                console.log('\u001B[31mRecord - R.I.P.\u001B[0m');
                res.json({success: ret});
            })
            .catch((err:any) => {
                res.status(500).send(err);
            });
    }
}