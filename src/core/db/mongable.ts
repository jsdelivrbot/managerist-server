import mongoose = require('mongoose');

export class Mongable
{

    public static monga(obj:any = null, special:any = {}) {
        let def = {};
        if (!obj) return {};

        for(let prop of Object.getOwnPropertyNames(obj)) {
            if (special[prop]) continue;

            switch (obj[prop].constructor.name) {
                case 'Array':
                    def = Object.assign(def, {[prop]: [String]});
                    break;
                case 'Boolean':
                case 'Number':
                case 'String':
                    def = Object.assign(def, {[prop]: obj[prop].constructor});
                    break;
                case 'Function':
                    break;
                default:
                    def = Object.assign(def, {
                        [prop]: {
                            type:  mongoose.Schema.Types.ObjectId,
                            ref: obj[prop].constructor.name
                        }
                    });
                    break;
            }
        }

        return Object.assign(def, special);
    }
}