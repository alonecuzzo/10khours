10K
========

10,000 hours to mastery! 10K tracks your habits, goals, activities or anything that you want.  It's said that it takes 10,000 hours to achieve mastery in anything.

### Installation

To run, you'll need Ruby installed, and then need to install the Sinatra gem.

```bash
$ sudo gem install sinatra
$ sudo gem install rerun
```

If you're using os x you can run the applescript in the home directory to fire things off fancily:

```bash
$ osascript boot.scpt
```
So we're all running the same tests:

```bash
$ ln -s ../../pre-commit.sh .git/hooks/pre-commit
```

Or the old-fashioned way...

To start Sinatra server:

```bash
$ cd dist/app/
$ rackup -p 4567
```

[url on heroku](http://bit23-alonecuzzo-10k.herokuapp.com/)

### File Structure 
10k is built following a [mochajs](http://visionmedia.github.com/mocha/)/[gruntjs](http://gruntjs.com) directory structure:

```bash
├── README.md
├── build
│   ├── 10k
│   │   ├── README.md
│   │   ├── grunt.js
│   │   │── package.json
│   │   └── tasks
├── dist
│   └── app
│       ├── Gemfile
│       ├── Gemfile.lock
│       ├── app.rb
│       ├── config.ru
│       ├── public
│       │   ├── css
│       │   │   └── 10k.min.css
│       │   ├── img
│       │   │   └── backgrounds
│       │   │       └── header-background.png
│       │   ├── js
│       │   │   └── 10k.min.js
│       │   └── lib
│       │       └── 10k-lib.min.js
│       └── views
│           └── index.erb
├── docs
│   ├── documentation.md
│   └── todo.TODO
├── lib
│   ├── backbone-localStorage-min.js
│   ├── backbone-min.js
│   ├── date.min.js
│   ├── jquery-1.8.3.min.js
│   ├── jquery-ui-1.9.2.custom.min.js
│   ├── json2.min.js
│   ├── modernizr-2.6.2-respond-1.1.0.min.js
│   ├── plugins.js
│   └── underscore-min.js
├── src
│   └── app
│       ├── css
│       │   ├── main.css
│       │   ├── main.scss
│       │   ├── normalize.css
│       │   ├── normalize.min.css
│       │   └── ui-progress-bar.css
│       └── js
│           └── 10khours.js
├── test
│   └── app
└── tmp
```

## Directories

**build/**: Contains node modules for grunt builds.  It also contains the grunt.js for the project.  Grunt builds are run from the the **build/10k/** directory. The **build/10k/tasks/** directory will contain any custom grunt tasks that are created.

**dist/**: This is the distributed site.  It is where all of the generated .css, .js, etc files get dumped.  It also contains configuration files for Sinatra and Rack.

**docs/**: Love letters of lulz.

**lib/**: Any proprietary libraries/frameworks such as jquery or backbone.

**src/**: These are the source files that get built for distribution.

**test/**: Mocha tests go here.

**tmp/**: Temporary place to throw files during build process.








