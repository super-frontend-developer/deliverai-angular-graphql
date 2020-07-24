import { IStore } from '@app/@core/models/store';

export interface IBusiness {
  id: string;
  name: string;
  stores: IStore[];
}

