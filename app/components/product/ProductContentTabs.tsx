import { useState, type MouseEvent } from 'react';
import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import { SallaPayments } from '@salla.sa/twilight-components-react/payments';
import { RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { BlockScope } from '@salla.sa/twilight-theme-engine/api/home';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { youtubeFacades } from '../../lib/descriptionVideos';
import { BlockHookSlot } from '../common';

interface ProductContentTabsProps {
  product: Product;
  commentsKey: string | number;
  showReviews: boolean;
  scope: BlockScope;
}

const IFRAME_TAG = /<iframe\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;

/** Embedded players load only when a shopper scrolls near them, unless already configured. */
function lazyIframes(html: string): string {
  return html.replace(IFRAME_TAG, (tag) =>
    /\sloading\s*=/i.test(tag.replace(/"[^"]*"|'[^']*'/g, '""'))
      ? tag
      : tag.replace(/^<iframe/i, '<iframe loading="lazy"')
  );
}

export function ProductContentTabs({ product, commentsKey, showReviews, scope }: ProductContentTabsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [playingVideos, setPlayingVideos] = useState<ReadonlySet<number>>(() => new Set());

  if (!product.description && !showReviews) return null;

  const description = youtubeFacades(
    lazyIframes((product.description ?? '').replace(/&nbsp;/g, '\n')),
    playingVideos,
    t('pages.products.play_video', 'Play video')
  );

  const playVideo = (event: MouseEvent<HTMLElement>) => {
    const facade = (event.target as Element).closest?.('[data-video-index]');
    if (!facade) return;
    const index = Number(facade.getAttribute('data-video-index'));
    setPlayingVideos((current) => new Set(current).add(index));
  };

  return (
    <section className="halla-product-content-tabs" aria-label={t('halla.product.content_label', 'تفاصيل المنتج')}>
      <div className="halla-product-content-tabs__buttons" role="group" aria-label={t('halla.product.content_label', 'تفاصيل المنتج')}>
        <button
          type="button"
          aria-pressed={activeTab === 'details'}
          onClick={() => setActiveTab('details')}
        >
          {t('halla.product.tab_details', 'التفاصيل')}
        </button>
        {showReviews && (
          <button
            type="button"
            aria-pressed={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
          >
            {t('halla.product.tab_reviews', 'التقييمات')}
          </button>
        )}
      </div>

      <div className="halla-product-content-tabs__panel">
        {activeTab === 'details' ? (
          <>
            {description && (
              <article
                className="halla-product-description article--main"
                onClick={playVideo}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
            <ProductBenefitsAndPayments />
          </>
        ) : (
          <>
            <BlockHookSlot
              name="product.single.before_customer_reviews"
              wrapper="s-before-reviews"
              scope={scope}
            />
            <RenderWhenVisible estimatedHeight="0px">
              <SallaComments key={commentsKey} itemId={product.id} type={'product' as never} />
            </RenderWhenVisible>
          </>
        )}
      </div>
    </section>
  );
}

function ProductBenefitsAndPayments() {
  const { t } = useTranslation();
  const benefits = [
    { icon: '😎', label: t('halla.product.fast_delivery', 'يوصلك أسرع شيء') },
    { icon: '💰', label: t('halla.product.best_value', 'الأكثر توفير دائمًا') },
    { icon: '💛', label: t('halla.product.guarantee', 'الضمان والتعويض') },
  ];

  return (
    <div className="halla-product-description-extras">
      <section className="halla-product-benefits" aria-label={t('halla.product.benefits_label', 'مزايا الشراء')}>
        {benefits.map(({ icon, label }) => (
          <div className="halla-product-benefit" key={label}>
            <span aria-hidden="true">{icon}</span>
            <strong>{label}</strong>
          </div>
        ))}
      </section>
      <div className="halla-product-payments" aria-label={t('halla.product.payments_label', 'طرق الدفع')}>
        <SallaPayments />
      </div>
    </div>
  );
}
