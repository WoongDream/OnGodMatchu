export type Comment = {
  id: number;
  content: string;
  authorPublicId: string;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommentPage = {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};
