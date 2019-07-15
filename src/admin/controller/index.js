const Base = require('./base.js');
const path = require('path');

module.exports = class extends Base {
  //入口页面
  indexAction() {
      return this.display(path.join(think.ROOT_PATH, 'www', 'admin', 'dist', 'index.html'));
  }
};
