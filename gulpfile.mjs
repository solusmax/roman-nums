import { deleteAsync } from 'del';
import { publish } from 'gh-pages';
import * as dartSass from 'sass';
import autoprefixer from 'autoprefixer';
import browserSync from 'browser-sync';
import cssnano from 'cssnano';
import fileinclude from 'gulp-file-include';
import gulp from 'gulp';
import gulpIf from 'gulp-if';
import gulpSass from 'gulp-sass';
import gulpWebpack from 'webpack-stream';
import htmlmin from 'gulp-htmlmin';
import imagemin, { optipng, svgo } from 'gulp-imagemin';
import magicImporter from 'node-sass-magic-importer';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import rev from 'gulp-rev';
import revRewrite from 'gulp-rev-rewrite';
import revDel from 'gulp-rev-delete-original';
import webpack from 'webpack';

const { series, parallel, src, dest, watch } = gulp;
const sass = gulpSass(dartSass);
const server = browserSync.create();

// ****************************** FILE STRUCTURE *******************************

const SRC_PATH = './src';
const BUILD_PATH = './build';

const SrcPaths = {
  HTML: `${SRC_PATH}/html`,
  SCSS: `${SRC_PATH}/scss`,
  JS: `${SRC_PATH}/js`,
  FONTS: `${SRC_PATH}/fonts`,
  FAVICON: `${SRC_PATH}/favicon`,
};

const SCSS_ENTRY_POINT = `${SrcPaths.SCSS}/style.scss`;
const JS_ENTRY_POINT = `./${SrcPaths.JS}/main.js`;

const SrcFiles = {
  HTML: [`${SrcPaths.HTML}/**/*.html`, `!${SrcPaths.HTML}/includes/**/*.html`],
  SCSS: [`${SrcPaths.SCSS}/**/*.scss`],
  JS: [`${SrcPaths.JS}/**/*.js`],
  FONTS: [`${SrcPaths.FONTS}/**/*`],
  FAVICON: [`${SrcPaths.FAVICON}/**/*`],
};

const BuildPaths = {
  HTML: `${BUILD_PATH}`,
  CSS: `${BUILD_PATH}/css`,
  JS: `${BUILD_PATH}/js`,
  FONTS: `${BUILD_PATH}/fonts`,
  FAVICON: `${BUILD_PATH}`,
};

const CSS_BUNDLE_FILENAME = 'style.min.css';
const JS_BUNDLE_FILENAME = 'script.min.js';

// **************************** UTILITY FUNCTIONS ******************************

let isProductionMode = false;

const enableProductionMode = (cb) => {
  isProductionMode = true;
  cb();
};

const reloadPage = (cb) => {
  server.reload();
  cb();
};

const clearBuildFolder = () => {
  return deleteAsync(`${BUILD_PATH}`, {
    force: true,
  });
};

const publishGhPages = (cb) => {
  publish(`${BUILD_PATH}/`, cb);
};

const bustCache = () => {
  return src(
    [
      `${BuildPaths.CSS}/${CSS_BUNDLE_FILENAME}`,
      `${BuildPaths.JS}/${JS_BUNDLE_FILENAME}`,
    ],
    { base: BUILD_PATH },
  )
    .pipe(rev())
    .pipe(revDel())
    .pipe(src(`${BuildPaths.HTML}/**/*.html`))
    .pipe(revRewrite())
    .pipe(dest(BuildPaths.HTML));
};

// ********************************* BUILDERS **********************************

// HTML

const buildHtml = () => {
  return src(SrcFiles.HTML)
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: '@root',
      }),
    )
    .pipe(
      htmlmin({
        caseSensitive: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
      }),
    )
    .pipe(dest(`${BuildPaths.HTML}`));
};

const _buildHtml = series(buildHtml);
export { _buildHtml as buildHtml };

// CSS

const buildCss = () => {
  return src(SCSS_ENTRY_POINT, { sourcemaps: !isProductionMode })
    .pipe(gulpIf(!isProductionMode, plumber()))
    .pipe(
      sass({
        importer: magicImporter(),
      }).on('error', sass.logError),
    )
    .pipe(postcss([autoprefixer()]))
    .pipe(gulpIf(isProductionMode, postcss([cssnano()])))
    .pipe(rename(CSS_BUNDLE_FILENAME))
    .pipe(dest(`${BuildPaths.CSS}`, { sourcemaps: '.' }));
};

const _buildCss = series(buildCss);
export { _buildCss as buildCss };

// JS

const buildJs = () => {
  return (
    src(JS_ENTRY_POINT, { sourcemaps: !isProductionMode })
      .pipe(gulpIf(!isProductionMode, plumber()))

      // Webpack config

      .pipe(
        gulpWebpack(
          {
            mode: isProductionMode ? 'production' : 'development',
            entry: JS_ENTRY_POINT,
            output: {
              filename: JS_BUNDLE_FILENAME,
            },
            devtool: isProductionMode ? false : 'source-map',
            module: {
              rules: [
                {
                  test: /\.(js)$/,
                  exclude: /(node_modules)/,
                  use: {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env'],
                    },
                  },
                },
              ],
            },
          },
          webpack,
        ),
      )

      .pipe(dest(`${BuildPaths.JS}`, { sourcemaps: '.' }))
  );
};

const _buildJs = series(buildJs);
export { _buildJs as buildJs };

// Fonts

const buildFonts = () => {
  return src(SrcFiles.FONTS).pipe(dest(`${BuildPaths.FONTS}`));
};

const _buildFonts = series(buildFonts);
export { _buildFonts as buildFonts };

// Favicons

const buildFavicon = () => {
  return src(SrcFiles.FAVICON)
    .pipe(
      gulpIf(
        isProductionMode,
        imagemin([
          optipng({
            optimizationLevel: 3,
          }),
          svgo(),
        ]),
      ),
    )
    .pipe(dest(`${BuildPaths.FAVICON}`));
};

const _buildFavicon = series(buildFavicon);
export { _buildFavicon as buildFavicon };

// ******************************* LOCAL SERVER ********************************

const startServer = () => {
  server.init({
    server: `${BUILD_PATH}`,
    cors: true,
    notify: false,
    injectChanges: false,
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false,
    },
  });

  // Watchers

  watch(SrcFiles.HTML, series(buildHtml, reloadPage));

  watch(SrcFiles.SCSS, series(buildCss, reloadPage));

  watch(SrcFiles.JS, series(buildJs, reloadPage));

  watch(SrcFiles.FONTS, series(buildFonts, reloadPage));

  watch(SrcFiles.FAVICON, series(buildFavicon, reloadPage));
};

// *********************************** TASKS ***********************************

const builders = [buildHtml, buildCss, buildJs, buildFonts, buildFavicon];

const buildDev = series(clearBuildFolder, parallel(...builders));
const buildProd = series(
  enableProductionMode,
  clearBuildFolder,
  parallel(...builders),
  bustCache,
);
const startDev = series(buildDev, startServer);
const deployGhPages = series(buildProd, publishGhPages);

const _default = startDev;
export { _default as default };

const _buildProd = buildProd;
export { _buildProd as buildProd };

const _buildDev = buildDev;
export { _buildDev as buildDev };

const _deployGhPages = deployGhPages;
export { _deployGhPages as deployGhPages };
