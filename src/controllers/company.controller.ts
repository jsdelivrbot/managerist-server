import {Company} from '../models/company';
import {CrudGameController} from "./crud.game.controller";

export class CompanyController extends  CrudGameController {
   _activeRecordClass = Company;

    constructor(app:any) {
        super(app, [{
            route: '/financials/:id*?',
            method: 'get',
            handler: 'actionFinancials'
        }]);
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    actionFinancials = (req: any, res: any, next: any) => {
        console.log('\u001B[35m GET Company Financials action ID=' + req.params.id + '\u001B[0m');
        return Promise.resolve(
            req.params.id
                ? Promise.resolve(req.params.id)
                : (<Company>this.ar).getCurrent().then((c:Company[]) => c.length && c[0]._id)
        )
            .then((id) => {
                return (<Company>this.ar).getFinancials(id)
                    .then((r: any) => res.json(r))
                    .catch((e: any) => res.statusCode = 404)
            });
    }

    /**
     * actionPost
     *
     * overloaded to add admin/permissions check
     *
     * @param req
     * @param res
     * @param next
     * @returns Promise<any>
     */
    actionPost = (req: any, res: any, next: any):Promise<any> => {
        return this.isAdmin
            .then((a:boolean) => {
                    if (!a) return Promise.reject('Allowed only for ADMIN');
                    // @ts-ignore TS2340
                    return super.actionPost(req, res, next);
                }
            );
    }

    /**
     * actionDelete
     *
     * overloaded to add admin/permissions check
     *
     * @param req
     * @param res
     * @param next
     * @returns Promise<any>
     */
    actionDelete = (req: any, res: any, next: any) => {
        return this.isAdmin
            .then((a:boolean) => {
                    if (!a) return Promise.reject('Allowed only for ADMIN')
                    // @ts-ignore TS2340
                    return super.actionDelete(req, res, next);
                }
            );
    }
}