import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import Dropdown from './Dropdown';
import type { DropdownOption } from './Dropdown.type';

const OPTIONS: DropdownOption<string>[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'oldest', label: '오래된순' },
];

describe('Dropdown', () => {
  describe('displayName', () => {
    it('has displayName "Dropdown"', () => {
      expect((Dropdown as { displayName?: string }).displayName).toBe('Dropdown');
    });
  });

  describe('초기 렌더', () => {
    it('선택된 옵션 라벨을 트리거에 표시한다', () => {
      renderWithTheme(<Dropdown options={OPTIONS} value="popular" onChange={vi.fn()} />);
      expect(screen.getByText('인기순')).toBeInTheDocument();
    });

    it('초기에 리스트가 닫혀있다 (aria-expanded=false)', () => {
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });

    it('초기에 listbox가 DOM에 없다', () => {
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('value와 일치하는 label이 없으면 빈 문자열을 표시한다', () => {
      renderWithTheme(
        <Dropdown options={OPTIONS} value={'unknown' as string} onChange={vi.fn()} />,
      );
      // 트리거는 존재하지만 값 영역이 비어있어야 한다
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('트리거 클릭 — 열기/닫기', () => {
    it('트리거 클릭 시 listbox가 노출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('트리거 클릭 시 aria-expanded가 true로 바뀐다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });

    it('열린 상태에서 트리거 재클릭 시 닫힌다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      await user.click(trigger);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('열린 상태에서 모든 옵션이 렌더된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      await user.click(screen.getByRole('button'));
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('최신순');
      expect(options[1]).toHaveTextContent('인기순');
      expect(options[2]).toHaveTextContent('오래된순');
    });
  });

  describe('옵션 선택', () => {
    it('옵션 클릭 시 onChange(value)가 호출된다', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={onChange} />);
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('인기순'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('popular');
    });

    it('옵션 클릭 후 listbox가 닫힌다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('인기순'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('aria-selected', () => {
    it('현재 value와 일치하는 옵션에 aria-selected=true가 붙는다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="popular" onChange={vi.fn()} />);
      await user.click(screen.getByRole('button'));
      const selectedOption = screen.getByRole('option', { name: '인기순' });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });

    it('현재 value와 다른 옵션에는 aria-selected=false가 붙는다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="popular" onChange={vi.fn()} />);
      await user.click(screen.getByRole('button'));
      const unselectedOption = screen.getByRole('option', { name: '최신순' });
      expect(unselectedOption).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('키보드 — Escape', () => {
    it('Escape 키를 누르면 listbox가 닫힌다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('Escape 후 aria-expanded가 false로 돌아온다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      await user.click(screen.getByRole('button'));
      await user.keyboard('{Escape}');
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('외부 클릭 시 닫힘', () => {
    it('드롭다운 외부를 클릭하면 listbox가 닫힌다', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <div>
          <Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />
          <button type="button" data-testid="outside">
            외부
          </button>
        </div>,
      );
      await user.click(screen.getByRole('button', { name: /최신순/i }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('disabled prop', () => {
    it('disabled=true이면 트리거 버튼이 disabled 속성을 가진다', () => {
      renderWithTheme(
        <Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} disabled={true} />,
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disabled=true이면 클릭해도 listbox가 열리지 않는다', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} disabled={true} />,
      );
      await user.click(screen.getByRole('button'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('disabled=false(기본값)이면 클릭 가능하다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      expect(screen.getByRole('button')).not.toBeDisabled();
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('ariaLabel prop', () => {
    it('ariaLabel이 트리거 버튼에 aria-label로 적용된다', () => {
      renderWithTheme(
        <Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} ariaLabel="정렬 방식 선택" />,
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '정렬 방식 선택');
    });

    it('ariaLabel 미지정 시 aria-label 속성이 없다', () => {
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-label');
    });
  });

  describe('키보드 — ArrowDown / ArrowUp / Enter', () => {
    beforeEach(() => {
      // 각 테스트마다 독립된 상태 보장
    });

    it('ArrowDown 으로 focusedIndex가 다음 항목으로 이동한다', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={onChange} />);
      // 열기 (focusedIndex는 현재 value 위치인 0)
      await user.click(screen.getByRole('button'));
      const listbox = screen.getByRole('listbox');
      // ArrowDown → focusedIndex 1 (인기순)
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      // Enter 로 선택
      fireEvent.keyDown(listbox, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('popular');
    });

    it('ArrowUp 으로 focusedIndex가 이전 항목으로 이동한다', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="popular" onChange={onChange} />);
      // 열기 (focusedIndex는 value 위치인 1)
      await user.click(screen.getByRole('button'));
      const listbox = screen.getByRole('listbox');
      // ArrowUp → focusedIndex 0 (최신순)
      fireEvent.keyDown(listbox, { key: 'ArrowUp' });
      fireEvent.keyDown(listbox, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('latest');
    });

    it('Enter 키로 현재 focusedIndex 항목이 선택된다', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={onChange} />);
      await user.click(screen.getByRole('button'));
      const listbox = screen.getByRole('listbox');
      // focusedIndex=0(latest), ArrowDown × 2 → focusedIndex=2(oldest)
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      fireEvent.keyDown(listbox, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('oldest');
    });

    it('ArrowDown이 마지막 항목에서 첫 번째로 순환한다', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="oldest" onChange={onChange} />);
      // 열기 (focusedIndex=2)
      await user.click(screen.getByRole('button'));
      const listbox = screen.getByRole('listbox');
      // ArrowDown → 순환하여 0(latest)
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      fireEvent.keyDown(listbox, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('latest');
    });

    it('Space 키로도 현재 focusedIndex 항목이 선택된다', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={onChange} />);
      await user.click(screen.getByRole('button'));
      const listbox = screen.getByRole('listbox');
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      fireEvent.keyDown(listbox, { key: ' ' });
      expect(onChange).toHaveBeenCalledWith('popular');
    });

    it('Enter 선택 후 listbox가 닫힌다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      await user.click(screen.getByRole('button'));
      const listbox = screen.getByRole('listbox');
      fireEvent.keyDown(listbox, { key: 'Enter' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('aria-haspopup', () => {
    it('트리거 버튼에 aria-haspopup="listbox" 속성이 있다', () => {
      renderWithTheme(<Dropdown options={OPTIONS} value="latest" onChange={vi.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });
});
