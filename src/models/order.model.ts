import type { BaseModel, ID } from './base.model';

export type Order = BaseModel & {
  products: [
    {
      productsId: string;
      amount: number;
    }
  ];

  userId: ID;
};
