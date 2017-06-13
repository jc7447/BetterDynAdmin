const watch = require('gulp-watch');
const gulp = require('gulp');
const env = require('gulp-env');

env({
    file: '.env'
  });

let source = ['*.js','*.css','parser/**','lib/**','html/**']; 
let destination =   process.env.destination;

console.log('dest %s, env js',destination, process.env.destination);

gulp.task('watch', function() {  


  gulp.src(source, {base: '.'})
    .pipe(watch(source, {base: '.'}))
    .pipe(gulp.dest(destination));
});

