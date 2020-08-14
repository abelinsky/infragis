import moduleAlias from 'module-alias';
//import path from 'path';

if (process.env.TS_NODE_DEV) {
  moduleAlias.addAliases({
    '@': __dirname,
  });
}

//   const IS_DEV = process.env.NODE_ENV === 'development';
// const rootPath = path.resolve(__dirname, '..');
// const rootPathDev = path.resolve(rootPath, 'src');
// const rootPathProd = path.resolve(rootPath, 'src');
// moduleAlias.addAliases({
//   '@': IS_DEV ? rootPathDev : rootPathProd,
// });
