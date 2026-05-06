export type ProfileImageSize = 'sm' | 'md' | 'lg' | 'xl';

export type ProfileImageProps = {
  nickname: string;
  imageUrl?: string | null;
  size?: ProfileImageSize;
};
