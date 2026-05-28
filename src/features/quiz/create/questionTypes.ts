export type DraftQuestion = {
  id: string;
  serverId?: number;
  questionText: string;
  answer: string;
  imageKey: string | null;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  answerImageKey: string | null;
  answerImageFile: File | null;
  answerImagePreviewUrl: string | null;
  answerImageSameAsQuestion: boolean;
};

export const createEmptyQuestion = (): DraftQuestion => ({
  id: crypto.randomUUID(),
  questionText: '',
  answer: '',
  imageKey: null,
  imageFile: null,
  imagePreviewUrl: null,
  answerImageKey: null,
  answerImageFile: null,
  answerImagePreviewUrl: null,
  answerImageSameAsQuestion: true,
});
