import type { VirtualRouteNode } from '@tanstack/virtual-file-routes';
import { route } from '@tanstack/virtual-file-routes';

// Keep the engine's loader and page metadata, but provide the finished Halla
// storefront as the initial page when a merchant has not arranged home blocks.
export const routes: VirtualRouteNode[] = [route('/', 'halla-home.tsx')];
