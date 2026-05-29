import { EMPTY_SLOT, type ImageSlot } from '@/lib/image/imageSlot';

export type DraftQuestion = {
  id: string;
  serverId?: number;
  questionText: string;
  answer: string;
  image: ImageSlot;
  answerImage: ImageSlot;
  answerImageSameAsQuestion: boolean;
};

export const createEmptyQuestion = (): DraftQuestion => ({
  id: crypto.randomUUID(),
  questionText: '',
  answer: '',
  image: { ...EMPTY_SLOT },
  answerImage: { ...EMPTY_SLOT },
  answerImageSameAsQuestion: true,
});
