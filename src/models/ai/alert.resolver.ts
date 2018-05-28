import * as Solutions from './solutions';
import {Alert} from "../alerts";
import {Solution} from "./solutions/solution";

export class AlertResolver {
    constructor(private _aiExpertise?:any) {}

    /**
     *
     * @param a
     * @returns {Promise<boolean>}
     */
    solve(a:Alert): Promise<boolean> {
        if (!a.type || !a.type.name)
            throw new Error('Alert have no populated type.');
        try {
            let solution:Solution = <Solution>(new Solutions[a.type.name + 'Solution']);
            return solution.solve(a);
        } catch (e) {
            throw new Error('Solution not found.' + e.message);
        }

    }
}