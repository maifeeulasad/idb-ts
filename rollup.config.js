import typescript from '@rollup/plugin-typescript';

export default {
  input: 'index.ts',
  external: ['reflect-metadata', 'tslib'],
  output: [
    {
      file: 'lib/index.esm.js',
      format: 'esm',
    },
    {
      file: 'lib/index.js',
      format: 'esm',
    },
    {
      file: 'lib/index.cjs',
      format: 'cjs',
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        declaration: false,
        module: 'esnext',
      },
    }),
  ],
};
