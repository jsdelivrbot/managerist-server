import {User as UserCommon} from '../common/models/user';
import {ActiveRecord, SchemaTypes} from "../core/db/active.record";

export {User as UserCommon, UserType} from '../common/models/user';

export class User extends ActiveRecord {
    private static _currentUser:any;

    protected _connection:string = 'main';
    protected _schema:any = {
        // Not mentioned in Common, so available only on server
        // yet exposed through AR interfaces (find, findById, findAll)
        // so don't forget to call *.common on AR instance before response
        providers : SchemaTypes.Mixed,
        uuid: String,
        type: String
    };

    public setProviderData(provider:string, data:any): Promise<any> {
        let providers = (<any>this).providers || {};
        providers[provider] = data;
        (<any>this).providers = providers;

        return this.save();
    }

    protected _common:any = UserCommon;

    public getCurrent(withArr ?: string[]) : Promise<User> {
        return User._currentUser
            ? Promise.resolve(User._currentUser)
            : this.withRelations(withArr).find({type: 0})
                .then(u => User._currentUser = u && u);
    }
}
