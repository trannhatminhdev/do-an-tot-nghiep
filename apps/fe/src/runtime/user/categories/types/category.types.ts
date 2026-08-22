export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}
