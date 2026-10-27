/** Manifeste audio servi au studio d'enregistrement. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function GET() {
  return new Response(readFileSync(join(process.cwd(), 'data', 'audio', 'manifest.json'), 'utf-8'), { headers: { 'Content-Type': 'application/json' } });
}
