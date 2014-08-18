var gulp = require('gulp');

var coffee = require('gulp-coffee');
var lesscss = require('gulp-less');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');

var paths = {
    scripts: "private/coffee/*.coffee",
    stylesheets: "private/less/*.less",
    images: "private/images/*"
};

gulp.task('scripts', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(paths.scripts)
        .pipe(coffee())
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('stylesheets', function() {
    return gulp.src(paths.stylesheets)
        .pipe(lesscss())
        .pipe(gulp.dest('public/stylesheets'));
});

// Copy all static images
gulp.task('images', function() {
  return gulp.src(paths.images)
    // Pass in options to the task
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('public/images'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch([paths.stylesheets, "private/less/**/*.less"], ['stylesheets']);
    gulp.watch(paths.images, ['images']);
});

gulp.task('default', ['scripts', 'stylesheets', 'images', 'watch']);
