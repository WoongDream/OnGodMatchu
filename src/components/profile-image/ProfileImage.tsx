import { memo } from 'react';
import type { ProfileImageProps } from './ProfileImage.type';
import { imageStyle, fallbackStyle } from './ProfileImage.style';
import { getInitial, getInitialColor } from './initial';

const ProfileImage = memo(({ nickname, imageUrl, size = 'md' }: ProfileImageProps) => {
  if (imageUrl) {
    return <img src={imageUrl} alt={`${nickname} 프로필 이미지`} css={imageStyle(size)} />;
  }

  const initial = getInitial(nickname);
  const color = getInitialColor(nickname);

  return (
    <div css={fallbackStyle(size, color)} role="img" aria-label={`${nickname} 프로필 이미지`}>
      {initial}
    </div>
  );
});

ProfileImage.displayName = 'ProfileImage';
export default ProfileImage;
