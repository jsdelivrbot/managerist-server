import {Solution} from "./solution";
import {Alert} from "../../alerts";
import {Employee} from "../../employee";
import {Role} from "../../role";
import {HireActionType} from "../../actions/types/hire.actiontype";

export class NoDeveloperSolution extends Solution {
    solve(a:Alert):Promise<boolean> {
        return (new Employee(a.ga)).withRelations(['role'])
            .findAll({visible: a.company._id || a.company})
            .then((hireable:Employee[]) => {
                let expectedRoles = ['Developer'].map((r:string) => Role.getByName(r)._id);
                return hireable.find((e:Employee) => expectedRoles.indexOf(e.role._id) !== -1);
            })
            .then((e:Employee) => {
                if (!e) return false;

                return (new HireActionType(a.ga)).do({
                    company: a.company,
                    employee: e
                });
            });

    }
}