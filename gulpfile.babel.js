import gulp from 'gulp';
import autoprefixer from 'autoprefixer';
import browserify from 'browserify';
import watchify from 'watchify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import eslint from 'gulp-eslint';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import rimraf from 'rimraf';
import notify from 'gulp-notify';
import browserSync, { reload } from 'browser-sync';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import nested from 'postcss-nested';
import vars from 'postcss-simple-vars';
import extend from 'postcss-simple-extend';
import cssnano from 'cssnano';
import partials from 'postcss-partial-import';
import htmlReplace from 'gulp-html-replace';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import runSequence from 'run-sequence';
import ghPages from 'gulp-gh-pages';
import useref from 'gulp-useref';
import _ from 'lodash';
import historyApiFallback from 'connect-history-api-fallback';
import gulpif from 'gulp-if';
import minifyCss from 'gulp-minify-css';

// https://github.com/Granze/react-starterify/

const paths = {
	bundle: 'app.js',
	entry: 'src/Index.js',
	srcCss: 'src/**/*.{scss,css}',
	srcImg: 'images/**',
	srcFonts: 'src/fonts/**',
	srcLint: ['src/**/*.js', 'test/**/*.js'],
	dist: 'dist',
	distJs: 'dist/js',
	distImg: 'dist/images',
	distFonts: 'dist/fonts',
	distDeploy: './dist/**/*'
};

const customOpts = {
	entries: [paths.entry],
	debug: true,
	cache: {},
	packageCache: {}
};

const opts = _.extend({}, watchify.args, customOpts);
// const opts = Object.assign({}, watchify.args, customOpts);

gulp.task('clean', cb => {
	rimraf('dist', cb);
});

gulp.task('browserSync', () => {
	browserSync({
		server: {
			baseDir: './',
			routes: {
				"/styles": "./dist/styles",
				"/js": "./dist/js"
				"/data": "./data"
			},
			middleware: [ historyApiFallback() ]
		}
	});
});

gulp.task('watchify', () => {
	const bundler = watchify(browserify(opts));

	function rebundle() {
		return bundler.bundle()
			.on('error', notify.onError())
			.pipe(source(paths.bundle))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest(paths.distJs))
			.pipe(reload({ stream: true }));
	}

	bundler.transform(babelify)
	.on('update', rebundle);
	return rebundle();
});

gulp.task('browserify', () => {
	return browserify(paths.entry, { debug: true })
	.transform(babelify)
	.bundle()
	.pipe(source(paths.bundle))
	.pipe(buffer())
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(uglify())
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(paths.distJs));
});

gulp.task('styles', () => {
	return gulp.src(paths.srcCss)
	.pipe(rename({ extname: '.css' }))
	.pipe(sourcemaps.init())
	.pipe(postcss([vars, partials, extend, nested, autoprefixer, cssnano]))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(paths.dist))
	.pipe(reload({ stream: true }));
});

gulp.task('htmlReplace', ['styles'], () => {

	return gulp
		.src('index.html')
		.pipe(useref({
			searchPath: 'dist'
		}))
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', minifyCss()))
		.pipe(gulp.dest(paths.dist));

});

gulp.task('images', () => {
	return gulp.src(paths.srcImg)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngquant()]
		}))
		.pipe(gulp.dest(paths.distImg));
});

gulp.task('fonts', () => {
	return gulp
		.src(paths.srcFonts)
		.pipe(gulp.dest(paths.distFonts));
});

gulp.task('lib', () => {
	return gulp.src(['lib/**/*', 'particles/**/*','bower_components/**/*','pdf/**/*','CNAME'], {
		base: '.'
	}).pipe(gulp.dest('dist'));
});

gulp.task('watchTask', () => {
	gulp.watch(paths.srcCss, ['styles']);
	// gulp.watch(paths.srcLint, ['lint']);
});

gulp.task('deploy', () => {
	return gulp
		.src('./dist/**/*')
		.pipe(ghPages());
});

gulp.task('watch', cb => {
	runSequence('clean', ['browserSync', 'watchTask', 'watchify', 'styles', 'fonts'], cb);
});

gulp.task('production', ['clean'], cb => {
	process.env.NODE_ENV = 'production';
	cb();
});
gulp.task('build', (cb) => {
	runSequence('production','browserify', 'lib', 'htmlReplace', 'images', 'fonts', cb);
});
