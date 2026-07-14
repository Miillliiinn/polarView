import { defineConfig } from '@prisma/config';

export default defineConfig({
  // ✅ On passe directement le chemin sous forme de string
  schema: './prisma/schema.prisma',
});