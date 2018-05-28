import {Position as PositionCommon} from '../common/models/position'
import {GameBased} from "./game.based";
import {Employee} from "./employee";
import {Company} from "./company";
import {Product} from "./product";
import {Project} from "./project";
import {Department} from "./department";
import {SchemaTypes, ActiveRecord} from "../core/db/active.record";

/**
 * Class Position
 *
 * @todo - maybe rename to WorkHistory, seems it will work the similar way
 */
export class Position extends GameBased {
    // common props
    parent:Position|any;
    employee:Employee|any;
    company:Company|any;
    department:Department|any;
    product:Product|any;
    project:Project|any;
    startDate:number;
    endDate:number;
    efficiency:number;

    protected _common = PositionCommon;
    protected _schema: any = {
        startDate: SchemaTypes.Date,
        endDate: SchemaTypes.Date,
        parent: SchemaTypes.ObjectId,
        employee: { type: SchemaTypes.ObjectId, ref: 'Employee' },
        company: SchemaTypes.ObjectId,
        department: SchemaTypes.ObjectId,
        product: SchemaTypes.ObjectId,
        project: SchemaTypes.ObjectId,
        role: SchemaTypes.ObjectId
    };

    /**
     * assign
     *
     * assign employee to certain position / job
     *
     * @param e
     * @param date
     * @returns {Promise<ActiveRecord>}
     */
    assign(e:Employee, date:number):Promise<Position> {
        return <Promise<Position>>this.populate({
            employee: e._id || e,
            startDate: date
        }).save();
    }

    /**
     * resign
     *
     * close certain position, and create related (if not closed)
     *
     * @param date
     * @param close
     * @returns {Promise<ActiveRecord>}
     */
    resign(date:number, close:boolean = false):Promise<Position|ActiveRecord> {
        return this.populate({
                endDate: date
            })
            .save()
            .then(() => {
                if (close)
                    return this;

                return (new Position(this.ga))
                    .populate(this.common)
                    .populate({
                        parent: this._id,
                        employee: null,
                        startDate: this.endDate,
                        endDate: null
                    })
                    .save()
            });
    }
}