import { createFileRoute } from '@tanstack/react-router';
import { Home, type HomeLoaderData } from '@salla.sa/twilight-theme-engine/routes/home';
import { HomeSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { HallaDefaultHome } from '../components/home/HallaDefaultHome';

export const Route = createFileRoute('/{-$locale}/')({
  loader: ({ params }): Promise<HomeLoaderData> => Home.loader({ locale: params.locale }),
  head: withHead(Home),
  pendingComponent: () => <HomeSkeleton />,
  component: HallaHomeRoute,
});

function HallaHomeRoute() {
  const data: HomeLoaderData = Route.useLoaderData();
  const { settings } = useTheme();
  const hallaSettings = settings as Record<string, unknown>;

  if (hallaSettings.halla_default_home !== false) {
    return <HallaDefaultHome />;
  }

  return <Home.Component {...data} />;
}
