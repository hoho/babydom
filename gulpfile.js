var gulp = require('gulp');

var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var qunit = require('gulp-qunit');


gulp.task('jshint', function() {
    return gulp.src(['gulpfile.js', 'babydom.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
    return gulp.src(['babydom.js'])
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(rename('babydom.min.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('qunit', ['uglify'], function() {
    return gulp.src('./test/*.html')
        .pipe(qunit());
});


gulp.task('default', ['jshint', 'uglify', 'qunit']);
