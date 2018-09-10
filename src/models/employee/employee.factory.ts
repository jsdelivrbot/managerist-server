import {GameActivity} from "../game";
import {Technology, ExpertiseLevel} from "../technology/technology";
import {ActiveRecord} from "../../core/db/active.record";
import {Employee, Gender} from "./employee";
import {Role} from "../role";
import {U} from "../../common/u";
import { Character } from "../character";

/**
 * Class EmployeeFactory
 */
export class EmployeeFactory {
    constructor(private _ga:GameActivity){}

    private static _facesAwailable = 10;

    public static randomFace(g: Gender) {
        return (g == Gender.Male ? 'm' : 'w') + '_' + (Math.floor(Math.random() * EmployeeFactory._facesAwailable) + 1);
    }

    private _extra4Lvl(lvl: ExpertiseLevel):number {
        let n: number = 0;
        switch(lvl) {
            case ExpertiseLevel.Expert:
                n = 10;
                break;
            case ExpertiseLevel.Senior:
                n = 5;
                break;
            case ExpertiseLevel.Junior:
                n = -2;
                break;
            case ExpertiseLevel.Intern:
                n = -5;
                break;
        }
        return n;
    }
    /**
     * generate
     *
     * fabric
     *
     * @param role
     * @param lvl
     * @param visible
     * @returns Promise<Employee|ActiveRecord>
     */
    public generate(role: Role, lvl: ExpertiseLevel, visible:any[] = []): Promise<Employee | ActiveRecord> {
        let gender = Math.random() > 0.5 ? Gender.Male : Gender.Female,
            chr:Character = new Character(role.trait);
        chr.updateRandom(this._extra4Lvl(lvl) + role.trait.n);
        return Technology.getForRole(role, lvl)
            .then((techs: any[]) => {
                return (new Employee(this._ga, {
                    name: U.personName(gender == Gender.Male),
                    pic: EmployeeFactory.randomFace(gender),
                    gender: gender,
                    character: chr.list,
                    expertise: techs,
                    role: role._id,
                    level: lvl,
                    visible: visible,
                    salary: Technology.determineMedianSalary(techs)
                })).save()
            });
    }
}