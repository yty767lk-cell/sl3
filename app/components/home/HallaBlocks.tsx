import { useEffect, useRef, useState, type ComponentType } from 'react';
import { ProductsSlider } from './ProductsSlider';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

type HallaItem = {
  image?: string;
  title?: string;
  url?: string;
  'items.image'?: string;
  'items.title'?: string;
  'items.url'?: string;
};

type HallaData = {
  desktop?: string;
  mobile?: string;
  background?: string;
  alt?: string;
  url?: string;
  title?: string;
  subtitle?: string;
  items?: HallaItem[];
  category?: number | string | { id?: number | string; value?: number | string } | Array<number | string | { id?: number | string; value?: number | string }>;
  limit?: number | string;
  sort?: string | { id?: number | string; value?: string } | Array<string | { id?: number | string; value?: string }>;
  orders_value?: string;
  orders_label?: string;
  years_value?: string;
  years_label?: string;
  rating_value?: string;
  rating_label?: string;
  products?: Array<number | string | { id?: number | string; value?: number | string }>;
};

function itemsFrom(data: HallaData): HallaItem[] {
  return (data.items ?? []).map((item) => ({
    image: item.image ?? item['items.image'],
    title: item.title ?? item['items.title'],
    url: item.url ?? item['items.url'],
  }));
}

function Banner({ data, story = false }: { data: HallaData; story?: boolean }) {
  if (story && !data.desktop) {
    return (
      <section className="halla-story halla-container" aria-label="عن عاريبك">
        <div className="halla-story-card">
          <span className="halla-story-kicker">عاريبك · ألعابك الرقمية</span>
          <h2>كل اللي تحبه بعالم الألعاب، بمكان واحد</h2>
          <p>اكتشف ألعاب الكمبيوتر والمنصات والاشتراكات الرقمية، واختر اللي يناسبك بسهولة.</p>
          <div className="halla-story-points">
            <span>🎮 خيارات متنوعة</span>
            <span>⚡ تسليم رقمي</span>
            <span>🔒 دفع آمن</span>
          </div>
        </div>
      </section>
    );
  }
  if (!data.desktop) return null;
  const image = (
    <picture>
      {data.mobile && <source media="(max-width: 767px)" srcSet={data.mobile} />}
      <img
        src={data.desktop}
        alt={data.alt ?? ''}
        width={story ? 1418 : 1440}
        height={story ? 900 : 710}
        fetchPriority={story ? 'auto' : 'high'}
        loading={story ? 'lazy' : 'eager'}
        decoding="async"
      />
    </picture>
  );
  const linkedImage = data.url
    ? data.url.startsWith('/')
      ? <Link to={data.url}>{image}</Link>
      : <a href={data.url}>{image}</a>
    : image;
  return (
    <section className={`halla-banner ${story ? 'halla-story' : 'halla-hero'}`}>
      {linkedImage}
    </section>
  );
}

function BrandSignature() {
  const { logo, name } = useStore();
  const { t } = useTranslation();

  return (
    <div className="halla-hero-brand" aria-label={t('halla.hero.brand_alt', 'عاريبك، رؤية السعودية 2030')}>
      {logo && <img className="halla-hero-brand__logo" src={logo} alt={name || t('halla.hero.brand_name', 'عاريبك')} />}
      <span className="halla-hero-brand__vision">
        <span className="halla-hero-brand__flag" role="img" aria-label={t('halla.hero.flag_alt', 'علم السعودية')}>🇸🇦</span>
        <span>{t('halla.hero.vision', 'رؤية السعودية')} <bdi>2030</bdi></span>
      </span>
    </div>
  );
}

export function HallaHero({ data }: { data: HallaData }) {
  const { t } = useTranslation();
  return (
    <section className="halla-hero">
      <Banner data={data} />
      <BrandSignature />
      <div className="halla-hero-copy">
        <span>{t('halla.hero.eyebrow', 'عاريبك للألعاب الرقمية')}</span>
        <h1>{t('halla.hero.title_line1', 'عيش اللعبة')}<br />{t('halla.hero.title_line2', 'على كيفك')}</h1>
        <p>{t('halla.hero.description', 'ألعاب، اشتراكات، وعروض رقمية تلقاها في مكان واحد.')}</p>
        <Link to="/-/c740860254">{t('halla.hero.cta', 'تسوق ألعاب ستيم')} <span aria-hidden="true">←</span></Link>
      </div>
    </section>
  );
}

type CountSpec = {
  prefix: string;
  suffix: string;
  number: string;
  target: number;
  fractionDigits: number;
  locale: string;
};

function countSpec(value: string): CountSpec | null {
  const match = value.match(/[0-9٠-٩۰-۹][0-9٠-٩۰-۹,٬.٫]*/);
  if (!match || match.index === undefined) return null;

  const rawNumber = match[0];
  const ascii = rawNumber
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٬,]/g, '')
    .replace(/[٫]/g, '.');
  const target = Number(ascii);
  if (!Number.isFinite(target)) return null;

  const fractionDigits = ascii.includes('.') ? ascii.split('.')[1].length : 0;
  const usesArabicDigits = /[٠-٩۰-۹]/.test(rawNumber);
  return {
    prefix: value.slice(0, match.index),
    suffix: value.slice(match.index + rawNumber.length),
    number: rawNumber,
    target,
    fractionDigits,
    locale: usesArabicDigits ? 'ar-SA' : 'en-US',
  };
}

function AnimatedStatValue({ value, active }: { value: string; active: boolean }) {
  const spec = countSpec(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!active || !spec) {
      setDisplay(value);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    const formatter = new Intl.NumberFormat(spec.locale, {
      useGrouping: /[,٬]/.test(spec.number),
      minimumFractionDigits: spec.fractionDigits,
      maximumFractionDigits: spec.fractionDigits,
    });
    const render = (amount: number) => `${spec.prefix}${formatter.format(amount)}${spec.suffix}`;
    const duration = 1200;
    let frame = 0;
    let start = 0;

    setDisplay(render(0));
    const tick = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(render(spec.target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setDisplay(value);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, spec?.target, value]);

  return <>{display}</>;
}

export function HallaStory({ data }: { data: HallaData }) {
  const store = useStore();
  const { t, isRTL } = useTranslation();
  const statsRef = useRef<HTMLElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const orderValue = data.orders_value || '4,000+';
  const yearsValue = data.years_value || '1+';
  const rating = store.rating?.stars;
  const ratingValue = typeof rating === 'number' && rating > 0
    ? `${rating.toFixed(1)}/5`
    : data.rating_value || t('halla.stats.rating_fallback', 'آراء العملاء');
  const ratingLabel = typeof rating === 'number' && rating > 0
    ? `${Number(store.rating?.total ?? 0).toLocaleString('ar-SA')} تقييم`
    : data.rating_label || t('halla.stats.rating_label', 'نعتز بثقتكم');

  useEffect(() => {
    const section = statsRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      setStatsVisible(entry.isIntersecting);
    }, { threshold: 0.25 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={statsRef}
      className={`halla-stats halla-container${statsVisible ? ' is-visible' : ''}`}
      aria-label={t('halla.stats.aria_label', 'عن عاريبك')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="halla-stats__intro">
        <span className="halla-stats__kicker">{t('halla.stats.kicker', 'متجر عاريبك للألعاب الرقمية')}</span>
        <h2>{t('halla.stats.title', 'تجربة ألعاب رقمية تليق بك')}</h2>
      </div>
      <div className="halla-stats__grid">
        <div className="halla-stat">
          <span className="halla-stat__icon" aria-hidden="true">★</span>
          <strong><AnimatedStatValue value={ratingValue} active={statsVisible} /></strong>
          <span>{ratingLabel}</span>
        </div>
        <div className="halla-stat">
          <span className="halla-stat__icon" aria-hidden="true">✦</span>
          <strong><AnimatedStatValue value={orderValue} active={statsVisible} /></strong>
          <span>{data.orders_label || t('halla.stats.orders_label', 'طلب وأكثر')}</span>
        </div>
        <div className="halla-stat">
          <span className="halla-stat__icon" aria-hidden="true">◷</span>
          <strong><AnimatedStatValue value={yearsValue} active={statsVisible} /></strong>
          <span>{data.years_label || t('halla.stats.years_label', 'سنة من خدمتكم')}</span>
        </div>
      </div>
    </section>
  );
}

function CategoryGrid({ data, columns = 4 }: { data: HallaData; columns?: 3 | 4 }) {
  const items = itemsFrom(data);
  if (!items.length) return null;
  return (
    <section className="halla-section">
      <div className="halla-heading">
        {data.title && <h2>{data.title}</h2>}
        {data.subtitle && <p>{data.subtitle}</p>}
      </div>
      <div className={`halla-container halla-grid halla-grid--${columns}`}>
        {items.map((item, index) => {
          const content = (
            <span className="halla-category-card__visual">
              {item.image ? (
                <img src={item.image} alt={item.title ?? ''} width="795" height="900" loading="lazy" decoding="async" />
              ) : <span className="halla-category-card__placeholder" aria-hidden="true">🎮</span>}
            </span>
          );
          return item.url ? (
            <Link key={`${item.url}-${index}`} to={item.url} aria-label={item.title}>
              {content}
            </Link>
          ) : (
            <div key={`${item.title}-${index}`}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}

export function HallaDiscovery({ data }: { data: HallaData }) {
  return <CategoryGrid data={data} columns={4} />;
}

export function HallaWorld({ data }: { data: HallaData }) {
  return <CategoryGrid data={data} columns={3} />;
}

export function HallaOffers({ data }: { data: HallaData }) {
  const ids = (data.products ?? [])
    .map((product) => typeof product === 'object' ? product.id ?? product.value : product)
    .map(Number)
    .filter((id) => Number.isFinite(id) && id > 0);
  const source = ids.length ? 'selected' : 'latest';
  return (
    <section className={`halla-offers ${data.background ? 'halla-offers--image' : ''}`}>
      <div className="halla-offer-art">
        {data.background && <img src={data.background} alt="" loading="lazy" decoding="async" />}
        <div className="halla-container">
          {data.title && <h2>{data.title}</h2>}
          {data.subtitle && <p>{data.subtitle}</p>}
        </div>
      </div>
      <div className="halla-container halla-product-rail">
        <ProductsSlider
          data={{
            products: { source, ...(ids.length ? { source_value: ids } : {}) },
            title: '',
            limit: Math.min(12, Math.max(1, Number(data.limit) || 8)),
          }}
        />
      </div>
    </section>
  );
}

function selectedId(value: HallaData['category']): number | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const raw = typeof first === 'object' && first !== null ? first.value ?? first.id : first;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

function selectedSort(value: HallaData['sort']): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const raw = typeof first === 'object' && first !== null ? first.value : first;
  return typeof raw === 'string' && raw.length ? raw : undefined;
}

export function HallaBestSelling({ data }: { data: HallaData }) {
  const { t } = useTranslation();
  const categoryId = selectedId(data.category) ?? 740860254;
  const sort = selectedSort(data.sort) || 'bestSell';
  const limit = Math.min(12, Math.max(1, Number(data.limit) || 12));
  const categoryUrl = `/-/c${categoryId}?sort=${encodeURIComponent(sort)}`;

  return (
    <section className="halla-best-selling halla-container" aria-label={data.title || t('halla.best_selling.title', 'الأكثر مبيعاً من ستيم')}>
      <div className="halla-heading halla-best-selling__heading">
        <div>
          <h2>{data.title || t('halla.best_selling.title', 'الأكثر مبيعاً من ستيم')}</h2>
          {data.subtitle && <p>{data.subtitle}</p>}
        </div>
        <Link to={categoryUrl} className="halla-best-selling__all">{t('halla.best_selling.display_all', 'عرض الكل')}</Link>
      </div>
      <ProductsSlider
        data={{
          products: { source: 'categories', source_value: [categoryId] },
          limit,
          sort,
        }}
      />
    </section>
  );
}

export const HallaHomeComponents: Record<string, ComponentType<{ data: HallaData }>> = {
  'halla-hero': HallaHero,
  'halla-story': HallaStory,
  'halla-discovery': HallaDiscovery,
  'halla-best-selling': HallaBestSelling,
  'halla-offers': HallaOffers,
  'halla-world': HallaWorld,
};
