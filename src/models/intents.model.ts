import type { BaseModel } from './base.model';

export type Intent = BaseModel & {
  tag: string;
  patterns: string[];
  responses: [
    [
      {
        type: string;
        text: string;
        tag?: string;
      }
    ]
  ];
  followUpQuestions: string[];
  userId: BaseModel['_id'];
};
