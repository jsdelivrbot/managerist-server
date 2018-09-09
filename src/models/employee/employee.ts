import {Employee as EmployeeCommon, Gender} from '../../common/models/employee';

export {Employee as EmployeeCommon, Gender} from '../../common/models/employee';
export {BasicProperty as EmployeeBasicProperty} from "../character";
import {GameBased} from "../game.based";
import {SchemaTypes, ActiveRecord, ActiveRecordRulesTypes, ActiveRecordRule, ActiveRecordError} from "../../core/db/active.record";

import {Project} from "../project";
import {Product} from "../product";
import {Company} from "../company";
import {Position} from "../position";
import {Technology, TechnologyUsage, KnownBranch, ExpertiseLevel, TechnologyExpertise} from "../technology";
import {Character, BasicProperty as EmployeeBasicProperty} from "../character";
import {Role} from "../role";
import {U} from "../../common/u";
import {Department} from "../department";
import { Log, LogLevel } from '../../core/utils/log';

/**
 * Class Employee
 *
 * @property character Character
 * @property role Role
 * @property expertise TechnologyExpertise[]
 */
export class Employee extends GameBased {
    // common
    role: Role;
    name: string;
    company: Company;
    position: Position;
    efficiency: number;
    character: Character;
    level: ExpertiseLevel;
    expertise: TechnologyExpertise[];

    visible: Company[];

    protected _common = EmployeeCommon;
    protected _schema: any = {
        role: SchemaTypes.ObjectId,
        level: String,
        product: SchemaTypes.ObjectId,
        project: SchemaTypes.ObjectId,
        company: SchemaTypes.ObjectId,
        expertise: SchemaTypes.Mixed,
        character: SchemaTypes.Mixed,

        visible: SchemaTypes.Mixed
    }

    get common() {
        let cmmn = this.filterProperties(
            Object.getOwnPropertyNames(new this._common).concat('_id')
        );
        if (cmmn.role && cmmn.role._id)
            cmmn.role = cmmn.role.common;
        if (this.character)
            cmmn.character = (<any>this).character.list || (<any>this).character;
        else
            Log.log(this, LogLevel.Error);
        return cmmn;
    }

    public get rules(): { [key: string]: ActiveRecordRule } {
        return {
            'role': {type: ActiveRecordRulesTypes.BELONGS, related: Role, external: true},
            'level': {type: ActiveRecordRulesTypes.ENUM, related: ExpertiseLevel}
        };
    }

    protected get attributes(): any {
        let res = this.filterProperties(this.fieldsList);
        //noinspection TypeScriptValidateTypes
        res.character = (<any>this).character.list || (<any>this).character;
        res.expertise = (<any>this).expertise ? (<any>this).expertise.map((t: any) => t.list || t) : {};
        return res;
    }

    /**
     *
     * @param {number} startDate
     * @param {Department | any} department
     * @param {Project | any} project
     * @param {Product | any} product
     * @returns {Promise<Employee>}
     */
    assign(startDate: number, department: Department, project: Project, product: Product): Promise<Employee> {
        if (!this.company)
            throw new Error('Employee not Hired yet, can\'t be assigned.');
        let efficiency = 0;
        return this.calculateEfficiency(department, project, product)
            .then((_e: number) => efficiency = _e)
            .then(() => {
                // @todo TODO? in case if we'll have projects for all Departments
                if (department.name != 'Production') {
                    product = null;
                    project = null;
                }

                return this.populate({
                    department: department._id,
                    product: product ? product._id : null,
                    project: project ? project._id : null,
                    efficiency: efficiency
                })
                .save()
                .then(() =>
                    (new Position(this.ga)).populate({
                        employee: this._id,
                        company: this.company._id || this.company,
                        department: department._id,
                        role: this.role._id || this.role,
                        product: product ? product._id : null,
                        project: project ? project._id : null,
                        startDate: startDate,
                        endDate: null,
                        efficiency: efficiency
                    })
                        .save()
                )
                .then(() => this);
            });
    }

    public calculateEfficiency(department:Department, project?: Project, product?: Product): Promise<number> {
        if (!project && !product)
            return Promise.resolve(0);

        if (!product) product = project.product;

        // TODO
        if (department.name !== 'Production')
            return Promise.resolve(0);

        let projects:Promise<Project[]> = project
            ? Promise.resolve([project])
            : <Promise<Project[]>>((new Project(this.ga)).findAll({product: product._id}));
        return projects
            .then((prjs: Project[]) => {
                if (!prjs.length)
                    return 0;

                let effs = prjs.map((prj:Project) => this.calculateTechEfficiency(prj.technologies));
                return U.sum(effs) / effs.length;
            });
    }

    /**
     * calculateTechEfficiency
     * 
     * calculate employees efficiency in certain technologies
     * 
     * @param tus 
     * 
     * @returns number
     */
    public calculateTechEfficiency(tus: TechnologyUsage[]): number {
        Log.log(this.common, LogLevel.Debug, {color: "cyan"});
        let eff: number =0,
            eff0: number = 0, // base eff - by level
            teff: number = 0;// tech eff
        switch(U.en(ExpertiseLevel, this.level)) {
            case ExpertiseLevel.Expert:
                eff0+=0.3;
            case ExpertiseLevel.Senior:
                eff0+=0.2;
            case ExpertiseLevel.Middle:
                eff0+=0.1;
            case ExpertiseLevel.Junior:
                eff0+=0.05;
            case ExpertiseLevel.Intern:
            default:
                eff0+=0;
        }
        for (let tu of tus) {
            let tuId = (tu.technology._id || tu.technology).toString(),
                exp = (this.expertise || []).find(ex => (ex.technology._id || ex.technology).toString()  == tuId);
            if (exp)
                teff += exp.volume * tu.volume;
        }
        eff = Math.max(eff0, teff + 0.1*eff0);
        Log.log("Emp " + U.e(ExpertiseLevel, this.level) + " eff:" + eff + "(0:" + eff0 + " t: " + teff + ")", LogLevel.Warning);
        return eff;
    }

    /**
     * calcStartSalary
     *
     * generate Salary for newly hired
     *
     * @param hr Employee
     * @returns {Promise<number>}
     */
    public calcStartSalary(hr: Employee | null = null): Promise<number> {
        let hrBonus = 1 - (hr ? hr.calcHrBonus() : 0);
        if (!this.role)
            throw new ActiveRecordError('Role shoud be populated on Employee record');

        return Technology.determineMedianSalary((<any>this).expertise, this.role)
            .then((estSalary: number) => {
                return estSalary * hrBonus;
            });
    }

    /**
     * calcHrBonus
     *
     * calculate probabilistic bonus that HR may have for salary amount decreasing
     * should depends on "GameComplexity" setting, @!MVP ~ ""
     */
    public calcHrBonus() {
        let hCh: Character = (<any>this).character,
            bonus = (hCh.Communication - 0.7) + (hCh.Appearance - 0.7) / 2;

        // TODO
        bonus *= 1; // GameComplexity ?

        return bonus;
    }

    /**
     * getter roleAr
     *
     * role active record
     *
     * @returns Promise<Role>
     */
    private get _roleAr(): Promise<Role | ActiveRecord> {
        if ((<any>this).role.name)
            return new Promise(() => Promise.resolve((<any>this).role));
        return (new Role()).findById((<any>this).role)
            .then((ar) => {
                (<any>this).role = ar.common;
                return ar;
            });
    }

    /**
     *
     * @returns {Promise<ActiveRecord>}
     */
    populateRelations(rels: string[] = []): Promise<ActiveRecord> {
        if (rels.concat(this.withArr).indexOf('role') !== -1 && (<any>this).role && !(<any>this).role._id) {
            return this._roleAr.then(() => this);
        }
        // TODO ~ sohuld be implemented in base AR
        return Promise.resolve(this);
    }
}
