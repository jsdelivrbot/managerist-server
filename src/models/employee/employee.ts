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
    skills: any[];
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
        if (cmmn.role._id)
            cmmn.role = cmmn.role.common;
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
                console.log('AA: eff = ' + efficiency);

                // TODO? in case if we'll have projects for all Departments
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

console.log('Efff 44 DEP = ' + department.name);

        let projects:Promise<Project[]> = project
            ? Promise.resolve([project])
            : <Promise<Project[]>>((new Project(this.ga)).findAll({product: product._id}));
console.log('EFFF for ' + product._id + '/' + project._id + '\n');
        return projects
            .then((prjs: Project[]) => {
                if (!prjs.length)
                    return 0;

                let effs = prjs.map((prj:Project) => {
                    console.log("Calculate efficiency of " + (<any>this).name + ' on ' + prj.name, prj.product);
                    console.log(this.expertise);
                    console.log('emp eff ~ ', prj.technologies);

                    let eff: number = 100;
                    for (let s of (prj && prj.common.skills) || [])
                        if (this.skills.indexOf(s) == -1)
                            eff /= 2;
                    return eff;
                });
                console.log('Effs = ', effs);
                return U.sum(effs) / effs.length;
            });
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
        // TODO add logic>> based on expertize, level
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
     * should depends on "GameComplexity" setting, @!MVC ~ ""
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
