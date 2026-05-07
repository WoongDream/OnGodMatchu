import { memo } from 'react';
import MyQuizCard from '@/components/my-quiz-card';
import type { MyQuizListProps } from './MyQuizList.type';
import { listStyle, itemStyle, emptyStyle } from './MyQuizList.style';

const MyQuizList = memo(
  ({
    items,
    onEdit,
    onDelete,
    isMutating = false,
    emptyLabel = '아직 만든 퀴즈가 없습니다.',
  }: MyQuizListProps) => {
    if (items.length === 0) {
      return <p css={emptyStyle}>{emptyLabel}</p>;
    }

    return (
      <ul css={listStyle}>
        {items.map((item) => (
          <li key={item.id} css={itemStyle}>
            <MyQuizCard item={item} onEdit={onEdit} onDelete={onDelete} isMutating={isMutating} />
          </li>
        ))}
      </ul>
    );
  },
);

MyQuizList.displayName = 'MyQuizList';
export default MyQuizList;
