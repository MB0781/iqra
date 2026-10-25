/** Catalogue des éléments révisables, chargé par la révision et le tableau de bord. */
import { catalogueRevision } from '../content/charger';

export function GET() {
  return new Response(JSON.stringify(catalogueRevision()), { headers: { 'Content-Type': 'application/json' } });
}
