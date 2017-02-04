let assertions = {};
let assertionUid = 0;

function uidGenerate() {
  return ++assertionUid;
}

function uidCurrent() {
  return assertionUid;
}

const pageTemplate = `
  <html>
    <head>
      <title>#{title}</title>
    </head>
    <body>
      <script>function after(ms, f) { setTimeout(f, ms); }</script>
      <script>#{script}</script>
    </body>
  </html>
`;

const headlessTemplate = `
  <html>
    <body>
      <script>function after(ms, f) { setTimeout(f, ms); }</script>
      <script>#{script}</script>
    </body>
  </html>
`;

class TestPage {
  constructor(template, parts) {
    this.template = template;
    this.parts = parts;
    this.uid = uidGenerate();
  }

  open(assertion) {
    const contents = expandString(this.template, this.parts);
    const endName = `testEnd_${this.uid}`;
    const end = `opener.${endName}(window)`;
    const contentsWithEnd = expandString(contents, {end: end});

    window[endName] = (childWindow) => {
      try {
        assertion(this);
        pass(this.uid);
      } catch(e) {
        fail(this.uid, e);
      } finally {
        childWindow.close();
        delete window[endName];
      }
    };

    this.childWindow = window.open('', '');
    this.childWindow.document.write(contentsWithEnd);
  }

  getTitle() {
    return this.childWindow.document.getElementsByTagName('title')[0].text;
  }

  getUid() {
    return this.uid;
  }
}

function expandString(string, replacements) {
  return Object.keys(replacements).reduce((expString, key) => {
    const re = new RegExp("#{" + key + "}", 'g');
    return expString.replace(re, replacements[key]);
  }, string);
}

function addPendingResult(uid, name) {
  const results = document.querySelector('.results');
  const item = document.createElement('li');
  item.id = `u${uid}`;
  item.className = 'test';
  item.innerHTML = `<span class="name">${name}</span><span class="result"></span>`;
  results.appendChild(item);
}

function registerResult(uid, name) {
  addPendingResult(uid, name);
}

function reportResult(uid, result, classToAdd = '') {
  const item = document.querySelector(`#u${uid}`);
  const resultElem = item.querySelector('.result');
  item.className = [item.className, classToAdd].join(' ');
  resultElem.textContent = result;
}

function assert(expected, actual) {
  if(expected !== actual)
    throw `Assertion failed. Expected "${expected}", actual "${actual}"`;
}

function runTests(tests) {
  Object.keys(tests).forEach(key => {
    const pageConfig = {
      title: tests[key]['title'] || 'Static title',
      script: tests[key]['script'] || ''
    };

    const template = tests[key]['template'] || pageTemplate;

    const testPage = new TestPage(template, pageConfig);
    addPendingResult(testPage.getUid(), key);
    testPage.open(tests[key].assertion);
  });
}

function pass(uid) {
  reportResult(uid, "Passed", 'pass');
}

function fail(uid, reason) {
  reportResult(uid, `Failed: ${reason}`, 'fail');
}

let tests = {
  testStaticTitle: {
    script: '#{end};',
    assertion: page => {
      assert('Static title - localpath', page.getTitle());
    }
  },
  testTitleHtmlRewrite: {
    script: `const title = document.getElementsByTagName('title')[0];
             title.innerHTML = 'Dynamic title';
             after(200, () => {#{end}});`,
    assertion: page => {
      assert('Dynamic title - localpath', page.getTitle());
    }
  },
  testTitleTextRewrite: {
    script: `const title = document.getElementsByTagName('title')[0];
             title.textContent = 'Dynamic title';
             after(200, () => {#{end}});`,
    assertion: page => {
      assert('Dynamic title - localpath', page.getTitle());
    }
  },
  testDelayedTitle: {
    script: `const title = document.getElementsByTagName('title')[0];
             after(200, () => {
                title.text = "Dynamic title";
                after(200, () => {#{end};});
              });`,
    assertion: page => {
      assert('Dynamic title - localpath', page.getTitle());
    }
  },
  testRepeatedTitleChange: {
    script: `const title = document.getElementsByTagName('title')[0];
             const titles = ['Title1', 'Title2', 'Title3'];
             function setTitle() {
               title.innerHTML = titles.shift();
               if(titles.length == 0)
                 after(200, () => {#{end}});
               else
                 after(200, setTitle);
             }
             setTitle();`,
    assertion: page => {
      assert('Title3 - localpath', page.getTitle());
    }
  },
  testPageWithoutHead: {
    template: headlessTemplate,
    script: `const head = document.getElementsByTagName('head')[0];
             const title = document.createElement('title');
             title.textContent = 'Dynamic page';
             head.appendChild(title);
             after(200, () => {#{end}});`,
    assertion: page => {
      assert('Dynamic page - localpath', page.getTitle());
    }
  }
};

runTests(tests);
