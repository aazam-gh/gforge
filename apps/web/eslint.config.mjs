import parser from '@typescript-eslint/parser';

export default [
  { ignores: ['.next/**', 'node_modules/**', 'dist/**'] },
  { files: ['**/*.{ts,tsx}'], languageOptions: { parser }, rules: {} },
  { files: ['**/*.{js,mjs}'], rules: {} },
];
