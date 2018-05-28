import {Product} from '../models/product';
import {CrudController} from "../core/crud.controller";

export class ProductController extends  CrudController {
   _activeRecordClass = Product;
}
