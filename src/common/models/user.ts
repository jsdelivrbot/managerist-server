export enum UserType {Player, AI0, AI1};
export class User {
    _id: any;
    name: string = '';
    administrator: boolean = false;
    type: UserType = UserType.AI0;
    last_game_id: any;
}
