class Elements {
  constructor(doc) {
    this.doc = doc;
  }

  getTitle() {
    const titles = this.doc.getElementsByTagName('title');
    return this.first(titles);
  }

  getHead() {
    const heads = this.doc.getElementsByTagName('head');
    return this.first(heads);
  }

  first(array) {
    if(array.length > 0)
      return array[0];
    else
      return null;
  }

  getDomain() {
    const location = this.doc.location;
    switch(this.doc.location.protocol) {
    case 'https:':
    case 'http:':
      return this.doc.location.host;
    case 'file:':
      return 'localpath';
    default:
      return '';
    }
  }
}

class AppendDomain {
  constructor(elements) {
    this.elements = elements;
    this.titleObserver = new MutationObserver((mutations, observer) => {
      this.onTitleChange(mutations, observer);
    });

    this.headObserver = new MutationObserver((mutations, observer) => {
      this.onHeadChange(mutations, observer);
    });
  }

  updateTitle(title) {
    const domain = this.elements.getDomain();
    if(!title.textContent.endsWith(domain))
      title.textContent += " - " + domain;
  }

  stopWatching() {
    this.headObserver.disconnect();
    this.titleObserver.disconnect();
  }

  watchTitle() {
    this.stopWatching();
    const title = this.elements.getTitle();
    this.updateTitle(title);
    this.titleObserver.observe(
      title,
      {childList: true, subtree: true, characterData: true}
    );
  }

  watchHead() {
    this.stopWatching();
    const head = this.elements.getHead();
    if(head)
      this.headObserver.observe(head, {childList: true});
  }

  run() {
    if(this.elements.getTitle())
      this.watchTitle();
    else
      this.watchHead();
  }

  onTitleChange(mutations, observer) {
    this.updateTitle(this.elements.getTitle());
  }

  onHeadChange(mutations, observer) {
    for(let i = 0; i < mutations.length; i++) {
      if(mutations[i].type == 'childList') {
        for(let j = 0; j < mutations[i].addedNodes.length; j++) {
          if(mutations[i].addedNodes[j].nodeName == 'TITLE') {
            this.watchTitle();
          }
        }
      }
    }
  }
}

const appendDomain = new AppendDomain(
  new Elements(document)
);

appendDomain.run();
