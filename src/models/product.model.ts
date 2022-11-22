import type { BaseModel } from './base.model';

export type Product = BaseModel & {
  title: string;
  type: string;
  sizes: {
    size: string;
    price: number;
  };
  amountLeft: number;
  images: string[];
  color?: string;
};
