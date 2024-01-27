export type BaseEntity = {
  id: number | string;
  created_at?: number;
};

export type ExampleData = BaseEntity & {
  message: string;
};
