import {Employee} from '../models/employee';
import {CrudGameController} from "./crud.game.controller";

export class EmployeeController extends  CrudGameController {
   _activeRecordClass = Employee;
}