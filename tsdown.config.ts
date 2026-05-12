import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/platform-types.ts',
    'src/social-types.ts',
    'src/economy-types.ts',
    'src/gamification-types.ts',
    'src/referral-codes.ts',
    'src/reserved-collection-prefixes.ts',
  ],
  format: 'esm',
  dts: false,
  sourcemap: false,
  clean: true,
});
