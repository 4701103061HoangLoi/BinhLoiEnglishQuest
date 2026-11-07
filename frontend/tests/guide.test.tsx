import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { QuestGuide } from '../src/components/QuestGuide';

describe('Mây quest companion', () => {
  it('changes expression and live feedback after answers, and offers keyboard help', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <QuestGuide hint="Chọn từ rồi chọn hình.">Cùng bắt đầu nhé!</QuestGuide>,
    );
    expect(
      screen.getByRole('img', { name: 'Mây sẵn sàng đồng hành' }),
    ).toBeInTheDocument();
    const help = screen.getByRole('button', { name: 'Nhờ Mây nhắc cách chơi' });
    await user.tab();
    expect(help).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(help).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Chọn từ rồi chọn hình.')).toBeVisible();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Chọn từ rồi chọn hình.')).not.toBeVisible();
    rerender(
      <QuestGuide mood="thinking" hint="Chọn từ rồi chọn hình.">
        Thử lại nhé.
      </QuestGuide>,
    );
    expect(
      screen.getByRole('img', { name: 'Mây đang suy nghĩ cùng bạn' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Thử lại nhé.');
    rerender(
      <QuestGuide mood="happy" hint="Chọn từ rồi chọn hình.">
        Chính xác!
      </QuestGuide>,
    );
    expect(
      screen.getByRole('img', { name: 'Mây vui mừng và giơ tay cổ vũ' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Chính xác!');
    rerender(
      <QuestGuide mood="celebrate" hint="Mở rương.">
        Nhận chìa khóa!
      </QuestGuide>,
    );
    expect(
      screen.getByRole('img', { name: 'Mây ăn mừng cùng bạn' }),
    ).toBeInTheDocument();
  });
});
