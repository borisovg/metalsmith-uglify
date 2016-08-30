'use strict';

var TOKENS = /\[([^\]]*)\]/g;

module.exports = function fillTemplate(template, tokens) {
  return template.replace(TOKENS, function (match, key) {
    return tokens[key] || '';
  });
};
