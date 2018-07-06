import {Product} from '../models/product';
import { CrudGameController } from './crud.game.controller';

export class ProductController extends  CrudGameController {
   _activeRecordClass = Product;

   public actionPost = (req: any, res: any, next: any):Promise<any> => {
        /** @TODO: if not sandbox */
        return Promise.resolve(
            res.status(403).send('Can\'t be changed directly, only through the game actions')
        );
    }

    public actionDelete = (req: any, res: any, next: any):Promise<any> => {
        /** @TODO: if not sandbox */
        return Promise.resolve(
            res.status(403).send('Can\'t be changed directly, only through the game actions')
        );
    }
}
