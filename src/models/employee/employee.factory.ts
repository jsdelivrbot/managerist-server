import {GameActivity} from "../game";
import {Technology, ExpertiseLevel} from "../technology/technology";
import {ActiveRecord} from "../../core/db/active.record";
import {Employee, Gender} from "./employee";
import {Role} from "../role";
import {U} from "../../common/u";

/**
 * Class EmployeeFactory
 */
export class EmployeeFactory {
    constructor(private _ga:GameActivity){}

    private static _facesAwailable = 10;

    public static randomFace(g: Gender) {
        return (g == Gender.Male ? 'm' : 'w') + '_' + Math.round(Math.random() * EmployeeFactory._facesAwailable);
    }

    /**
     * generate
     *
     * fabric
     *
     * @param role
     * @param lvl
     * @returns Promise<Employee|ActiveRecord>
     */
    public generate(role: Role, lvl: ExpertiseLevel): Promise<Employee | ActiveRecord> {
        let gender = Math.random() > 0.5 ? Gender.Male : Gender.Female;
        return Technology.getForRole(role, lvl)
            .then((techs: any[]) => {
                return (new Employee(this._ga, {
                    name: U.personName(),
                    pic: EmployeeFactory.randomFace(gender),
                    gender: gender,
                    character: role.character.list,
                    expertise: techs,
                    role: role._id,
                    level: lvl
                })).save()
            })
            .catch(e => {
                console.log(e.message);
                return null;
            });
    }
}