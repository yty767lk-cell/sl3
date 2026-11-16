import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import {
  HallaBestSelling,
  HallaDiscovery,
  HallaHero,
  HallaOffers,
  HallaStory,
} from './HallaBlocks';

type SettingMap = Record<string, unknown>;
type Item = { image: string; title: string; url: string };

const DEFAULT_DISCOVERY: Item[] = [
  { image: '/halla/11.webp', title: 'ستيم', url: '/-/c740860254' },
  { image: '/halla/10.webp', title: 'بلايستيشن', url: '/-/c1980267989' },
  { image: '/halla/12.webp', title: 'إكس بوكس', url: '/-/c1467946351' },
  { image: '/halla/08.webp', title: 'يوتيوب', url: '/-/c314697870' },
];

function text(settings: SettingMap, key: string, fallback: string): string {
  const value = settings[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function number(settings: SettingMap, key: string, fallback: number): number {
  const value = Number(settings[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function collection(settings: SettingMap, key: string, fallback: Item[]): Item[] {
  const value = settings[key];
  if (!Array.isArray(value) || value.length === 0) return fallback;

  const items = value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const item = entry as Record<string, unknown>;
    const image = item.image ?? item['items.image'];
    const title = item.title ?? item['items.title'];
    const url = item.url ?? item['items.url'];
    if (typeof image !== 'string' || !image.trim()) return [];
    return [{
      image,
      title: typeof title === 'string' ? title : '',
      url: typeof url === 'string' ? url : '',
    }];
  });

  return items.length ? items : fallback;
}

function enabled(settings: SettingMap, key: string): boolean {
  return settings[key] !== false;
}

export function HallaDefaultHome() {
  const { settings } = useTheme();
  const values = settings as SettingMap;
  const category = values.halla_default_steam_category;
  const selectedCategory = Array.isArray(category) ? category[0] : category;
  const categoryValue =
    selectedCategory && typeof selectedCategory === 'object' && 'value' in selectedCategory
      ? selectedCategory.value
      : selectedCategory;

  return (
    <div className="halla-default-home">
      {enabled(values, 'halla_default_show_hero') && (
        <HallaHero
          data={{
            desktop: text(values, 'halla_default_hero_desktop', '/halla/3areb-hero.jpg'),
            mobile: text(values, 'halla_default_hero_mobile', ''),
            alt: text(values, 'halla_default_hero_alt', 'ألعابك وخدماتك الرقمية في مكان واحد'),
            url: text(values, 'halla_default_hero_url', ''),
          }}
        />
      )}

      {enabled(values, 'halla_default_show_story') && (
        <HallaStory
          data={{
            orders_value: text(values, 'halla_default_orders_value', '4,000+'),
            orders_label: text(values, 'halla_default_orders_label', 'طلب وأكثر'),
            years_value: text(values, 'halla_default_years_value', '1+'),
            years_label: text(values, 'halla_default_years_label', 'سنة من خدمتكم'),
            rating_value: text(values, 'halla_default_rating_value', 'آراء العملاء'),
            rating_label: text(values, 'halla_default_rating_label', 'نعتز بثقتكم'),
          }}
        />
      )}

      {enabled(values, 'halla_default_show_discovery') && (
        <HallaDiscovery
          data={{
            title: text(values, 'halla_default_discovery_title', 'اكتشف أقسام عاريبك'),
            subtitle: text(values, 'halla_default_discovery_subtitle', 'كل اللي تحتاجه للألعاب والخدمات الرقمية في مكان واحد'),
            items: collection(values, 'halla_default_discovery_items', DEFAULT_DISCOVERY),
          }}
        />
      )}

      {enabled(values, 'halla_default_show_best_selling') && (
        <HallaBestSelling
          data={{
            title: text(values, 'halla_default_steam_title', 'الأكثر مبيعاً من ستيم'),
            subtitle: text(values, 'halla_default_steam_subtitle', 'اختيارات يفضلها لاعبو ستيم'),
            category: (categoryValue as string | number | undefined) ?? 740860254,
            limit: number(values, 'halla_default_steam_limit', 12),
            sort: 'bestSell',
          }}
        />
      )}

      {enabled(values, 'halla_default_show_offers') && (
        <HallaOffers
          data={{
            background: text(values, 'halla_default_offers_background', '/halla/offer.webp'),
            title: text(values, 'halla_default_offers_title', 'عروض عاريبك'),
            subtitle: text(values, 'halla_default_offers_subtitle', 'أسعار مميزة على اختياراتك الرقمية'),
            limit: number(values, 'halla_default_offers_limit', 8),
          }}
        />
      )}
    </div>
  );
}
