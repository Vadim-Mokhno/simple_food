const {src, dest, watch, parallel, series} = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concatFiles = require('gulp-concat');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const svgSprite = require('gulp-svg-sprite');

exports.styles = styles;
exports.browserSyncronisation = browserSyncronisation;
exports.watching = watching;
exports.scripts = scripts;
exports.images = images;
exports.svgSprites = svgSprites;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);
exports.default = parallel(svgSprites, styles, scripts, watching, browserSyncronisation);


function styles() {
	return src('app/scss/style.scss')
		.pipe(scss({outputStyle: 'expanded'}))
		.pipe(concatFiles('style.min.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 10 versions'],
			grid: true
		}))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream());
}

function browserSyncronisation() {
	browserSync.init({
		server: {
			baseDir: 'app/'
		},
		notify: false
	});
}

function scripts() {
	return src(['node_modules/jquery/dist/jquery.js', 'app/js/main.js'])
		.pipe(concatFiles('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js/'));
}

function images() {
	return src('app/images/**/*.*')
		.pipe(
			imagemin([
				imagemin.gifsicle({
					interlaced: true,
				}),
				imagemin.mozjpeg({
					quality: 75,
					progressive: true,
				}),
				imagemin.optipng({
					optimizationLevel: 5,
				}),
				imagemin.svgo({
					plugins: [
						{
							removeViewBox: true,
						},
						{
							cleanupIDs: false,
						},
					],
				}),
			])
		)
		.pipe(dest('dist/images'));
}

function cleanDist() {
	return del('dist');
}

function build() {
	return src(['app/**/*.html', 'app/css/style.min.css', 'app/js/main.min.js'],
		{base: 'app'})
		.pipe(dest('dist'));
}

function svgSprites() {
  return src('app/images/icons/*.svg') // выбираем в папке с иконками все файлы с расширением svg
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg', // указываем имя файла спрайта и путь
          },
        },
      })
    )
		.pipe(dest('app/images')); // указываем, в какую папку поместить готовый файл спрайта
}

function watching() {
	watch(['app/scss/**/*.scss'], styles);
	watch(['app/images/icons/*.svg'], svgSprites);
	watch(['app/**/*.html']).on('change', browserSync.reload);
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
}