let project_folder = "dist";
let source_folder = "#src";
let fs = require('fs');

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
    },
    clean: "./" + project_folder + "/"
}

let{ src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require("gulp-webpcss");
    //svgSprite = require("gulp-svg-sprite"),
    //ttf2woff = require("gulp-ttf2woff"),
    //ttf2woff2 = require("gulp-ttf2woff2"),
    //fonter = require("gulp-fonter");

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        browser: 'chrome',
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded"
            })
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                grid: true,
                overrideBrowserlist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(
            webpcss({
                webpClass: '.webp',
                noWebpClass: '.no-webp'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}


function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}


function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 // от 0 до 7
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

//function fonts() {
//    src(path.src.fonts)
//        .pipe(ttf2woff())
//        .pipe(dest(path.build.fonts))
//    return src(path.src.fonts)
//        .pipe(ttf2woff2())
//        .pipe(dest(path.build.fonts))
//};

//gulp.task('otf2ttf', function () {
//    return gulp.src([source_folder + '/fonts/*.otf'])
//        .pipe(fonter({
//            formats: ['ttf']
//        }))
//        .pipe(dest(source_folder + '/fonts/'));
//})


//function fontsStyle(cb) {
//    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss'); 
//    if (file_content == '') { 
//        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb); 
//        return fs.readdir(path.build.fonts, function (err, items) { 
//            if (items) { 
//                let c_fontname; 
//                for (var i = 0; i < items.length; i++) { 
//                    let fontname = items[i].split('.'); 
//                    fontname = fontname[0]; 
//                    if (c_fontname != fontname) { 
//                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb); 
//                    } 
//                    c_fontname = fontname; 
//                } 
//            } 
//        }) 
//    }
//    
//}


//function cb() {
//}

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, images, css, html));
let watch = gulp.parallel(build, watchFiles, browserSync);


//exports.fontsStyle = fontsStyle;
//exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;