import { Project } from '../models/project';
import {CrudController} from "../core/crud.controller";

export class ProjectController extends  CrudController {
   _activeRecordClass = Project;
}