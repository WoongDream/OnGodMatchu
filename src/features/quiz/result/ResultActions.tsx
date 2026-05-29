import { memo } from 'react';
import Button from '@/components/button';
import ShareButton from '@/components/share-button';
import StarButton from '@/components/star-button';
import { trailingStyle, wrapperStyle } from './ResultActions.style';

type ResultActionsProps = {
  starred: boolean;
  starCount: number;
  shareCount: number;
  starDisabled?: boolean;
  onRetry: () => void;
  onStar: () => void;
  onShare: () => void;
};

const ResultActions = memo(
  ({
    starred,
    starCount,
    shareCount,
    starDisabled = false,
    onRetry,
    onStar,
    onShare,
  }: ResultActionsProps) => {
    return (
      <div css={wrapperStyle}>
        <Button size="md" onClick={onRetry}>
          다시 풀기
        </Button>
        <div css={trailingStyle}>
          <StarButton
            variant="chip"
            size="lg"
            active={starred}
            count={starCount}
            disabled={starDisabled}
            onClick={onStar}
          />
          <ShareButton variant="chip" size="lg" count={shareCount} onClick={onShare} />
        </div>
      </div>
    );
  },
);

ResultActions.displayName = 'ResultActions';
export default ResultActions;
