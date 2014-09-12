'use strict';

var gulp = require('gulp');

var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var qunit = require('gulp-qunit');


gulp.task('jshint', function() {
    return gulp.src(['gulpfile.js', 'babydom.js'])
        .pipe(eslint({
            rules: {
                'quotes': [2, 'single'],
                'no-shadow-restricted-names': 0,
                'no-underscore-dangle': 0
            },
            env: {
                'node': true,
                'browser': true
            }
        }))
        .pipe(eslint.format());
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


gulp.task('assert-version', function(err) {
    var assertVersion = require('assert-version');

    err(assertVersion({
        'babydom.js': '',
        'bower.json': ''
    }));
});


gulp.task('default', ['jshint', 'assert-version', 'uglify', 'qunit']);
