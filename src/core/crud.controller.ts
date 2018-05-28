import {Model} from "mongoose";
import {BaseController} from "./base.controller";
import {ActiveRecord, ActiveRecordInterface} from "../core/db/active.record";

export abstract class CrudController extends BaseController {
    protected _activeRecordClass: ActiveRecordInterface;

    get activeRecordClass() {
        return this._activeRecordClass;
    }

    protected get ar():ActiveRecord {
        return (new  this.activeRecordClass);
    }
    constructor(app:any, routes?: {route:string, method:string, handler:string}[]) {
        super(app, routes);

        app.get(this.baseRoute + '/list/:search*?', this.actionList);

        /**
         * Create / Update entity
         * @database
         */
        app.post(this.baseRoute, this.actionPost);

        /**
         * Delete name.
         * @database
         */
        app.delete(this.baseRoute + '/:id*?', this.actionDelete);

        /**
         * Get single. ~ should be Lowest priority
         * @database
         */
        app.get(this.baseRoute + '/:id', this.actionGet);
    }

    actionGet = (req: any, res: any, next: any) => {
        console.log('\u001B[35m GET action\u001B[0m');
        let withParam = req.query.with || [];
        //req.query.with && delete(req.query.with);

        this.ar
            .withRelations(withParam)
            .findById(req.params.id)
            .then((ar:ActiveRecord|null) => {
                if (!ar)
                    return res.statusCode = 404;
                return res.json(ar.common);
            })
            .catch((err:any) => res.status(500).send(err));
    }

    actionList = (req: any, res: any, next: any) => {
        let filter = req.params.search
                ? {name: new RegExp(req.params.search, 'i')}
                : req.query,
            withParam = req.query.with || [];
        req.query.with && delete(req.query.with);

        this.ar
            .withRelations(withParam)
            .findAll(filter)
            .then((data:ActiveRecord[]) => {
                res.json(data.map(d => d.common));
            })
            .catch((err:any) => res.status(500).send(err));
    }

    actionPost = (req: any, res: any, next: any) => {
        (<Promise<ActiveRecord>>(req.body._id
            ? (new this.activeRecordClass).findById(req.body._id)
            : Promise.resolve(new this.activeRecordClass)
        )).then((ar:ActiveRecord) => {
            console.log("NEW AR:", ar.common);
            console.log("BODY:", req.body);
            ar.populate(req.body)
                .save()
                .then(() => res.json({success: true, id: ar._id}))
                .catch((err:any) => res.status(500).send(err));
        });
    }

    actionDelete = (req: any, res: any, next: any) => {
        let id = req.params.id || req.body.id;
        if (!id)
            return res.status(404).send('ID required');

        this.ar.delete(id)
            .then((ret:boolean) => {
                console.log('\u001B[31mRecord - R.I.P.\u001B[0m');
                res.json({success: ret});
            })
            .catch((err:any) => {
                res.status(500).send(err);
            });
    }


    _beforeSave: (data:any)=>Promise<any> = (data: any)  => Promise.resolve(data);
}