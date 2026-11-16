import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import type { BlockScope } from '@salla.sa/twilight-theme-engine/api/home';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductContentTabs } from '../../../app/components/product/ProductContentTabs';

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback ?? _key }),
}));

vi.mock('@salla.sa/twilight-components-react/comments', () => ({
  SallaComments: ({ itemId }: { itemId: number }) => <div data-testid="comments" data-item-id={itemId} />,
}));

vi.mock('@salla.sa/twilight-components-react/payments', () => ({
  SallaPayments: () => <div data-testid="payments" />,
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  RenderWhenVisible: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('../../../app/components/common', () => ({ BlockHookSlot: () => null }));

function renderTabs(description: string, showReviews = true) {
  const product = { id: 42, description } as Product;
  return render(
    <ProductContentTabs
      product={product}
      commentsKey={0}
      showReviews={showReviews}
      scope={{ product_id: product.id } as BlockScope}
    />
  );
}

describe('ProductContentTabs product description', () => {
  it('loads embedded iframes lazily while preserving explicit loading settings', () => {
    const description =
      '<p>Intro</p><iframe class="ql-video" src="https://www.youtube.com/embed/x"></iframe>' +
      '<iframe loading="eager" src="https://maps.test/embed"></iframe>' +
      '<iframe loading = "eager" src="https://maps.test/spaced"></iframe>' +
      '<iframe title="A > B" loading="eager" src="https://maps.test/quoted"></iframe>' +
      '<iframe title="no loading=here" src="https://player.vimeo.com/video/1"></iframe>';
    const { container } = renderTabs(description);
    const frames = [...container.querySelectorAll('.halla-product-description iframe')];

    expect(frames).toHaveLength(5);
    expect(frames.map((frame) => frame.getAttribute('loading'))).toEqual([
      'lazy',
      'eager',
      'eager',
      'eager',
      'lazy',
    ]);
  });

  it('uses a thumbnail for YouTube and loads the player after the shopper selects it', () => {
    const { container } = renderTabs(
      '<p>Intro</p><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>'
    );
    const facade = container.querySelector<HTMLButtonElement>('.video-facade');

    expect(facade?.getAttribute('aria-label')).toBe('Play video');
    expect(container.querySelector('.halla-product-description iframe')).toBeNull();

    fireEvent.click(facade!.querySelector('img')!);

    expect(container.querySelector('.halla-product-description iframe')?.getAttribute('src'))
      .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
    expect(container.querySelector('.video-facade')).toBeNull();
  });

  it('shows Salla reviews only in the reviews tab', () => {
    const { container, getByRole } = renderTabs('<p>Product details</p>');

    expect(container.querySelector('[data-testid="comments"]')).toBeNull();
    fireEvent.click(getByRole('button', { name: 'التقييمات' }));
    expect(container.querySelector('[data-testid="comments"]')?.getAttribute('data-item-id')).toBe('42');
  });

  it('omits the reviews tab when the store disables product ratings', () => {
    const { getByRole, queryByRole } = renderTabs('<p>Product details</p>', false);

    expect(getByRole('button', { name: 'التفاصيل' })).toBeTruthy();
    expect(queryByRole('button', { name: 'التقييمات' })).toBeNull();
  });
});
