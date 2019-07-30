( function () {
	var languageJson = {"en":{"ext-whowrotethat-activation-link":"WhoWroteThat","ext-whowrotethat-activation-link-tooltip":"Activate WhoWroteThat"}};
	function loadWhoWroteThat() {
		var interfaceLang = $( 'html' ).attr( 'lang' ),
			$button = $( '<a>' )
				.text( 'WhoWroteThat' )
				.addClass( 'wwt-activationButton' )
				.prependTo( '#p-personal' )
				.click( onActivateButtonClick );

		// Load messages
		mw.messages.set( $.extend(
			// Make sure to fallback on English
			languageJson.en,
			languageJson[ interfaceLang ]
		) );

		// Attach button to DOM; jQuery is available

		function onActivateButtonClick( e ) {
			mw.loader.using( [ 'oojs-ui' ] ).then( function () {

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

<<<<<<< HEAD
/**
 * Interface to the [WikiWho](https://www.wikiwho.net/) WhoColor API.
 *
 * @class
 */
=======
>>>>>>> Convert to ES6 and add mocha tests and babel to build steps
var Api =
/*#__PURE__*/
function () {
  /**
  * @param {Object} config
  * @cfg config.url The WikiColor base URL.
  * @constructor
  */
  function Api(config) {
    _classCallCheck(this, Api);

    config = config || {};
    this.tries = 0;
    this.url = config.url || ''; // Remove trailing slash.

    if (this.url && this.url.slice(-1) === '/') {
      this.url = this.url.slice(0, -1);
    }
  }
  /**
<<<<<<< HEAD
   * Get the value of a parameter from the given URL query string.
   *
   * @protected
=======
   * Get the value of a paramter from the given URL query string.
   *
>>>>>>> Convert to ES6 and add mocha tests and babel to build steps
   * @param  {string} querystring URL query string
   * @param  {string} param Parameter name
   * @return {string|null} Parameter value; null if not found
   */


  _createClass(Api, [{
    key: "getQueryParameter",
    value: function getQueryParameter(querystring, param) {
      var urlParams, regex, results;

      if (querystring === '') {
        return null;
      }

      try {
        urlParams = new URLSearchParams(querystring);
        return urlParams.get(param);
      } catch (err) {
        // Fallback for IE and Edge
        // eslint-disable-next-line no-useless-escape
        param = param.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        regex = new RegExp('[\\?&]' + param + '=([^&#]*)');
        results = regex.exec(querystring);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
      }
    }
    /**
<<<<<<< HEAD
     * Get a WhoColor API URL based on a given wiki URL.
     *
     * @param  {string} wikiUrl URL of the wiki page that we want to analyze.
     * @return {string} Ajax URL for the data from WhoColor.
=======
     * Get the relevant AJAX url from whocolor based on the given
     * base URL of the wiki.
     *
     * @param  {string} wikiUrl URL of the wiki page that we want to analyze.
     * @return {string} Ajax URL for the data from whocolor
>>>>>>> Convert to ES6 and add mocha tests and babel to build steps
     */

  }, {
    key: "getAjaxURL",
    value: function getAjaxURL(wikiUrl) {
      var parts,
          oldId,
          title,
          lang,
          matches,
          queryString,
          linkNode = document.createElement('a');
      linkNode.href = wikiUrl;
      queryString = linkNode.search;
      title = this.getQueryParameter(queryString, 'title');

      if (title) {
        // URL is like: https://en.wikipedia.org/w/index.php?title=Foo&oldid=123
        matches = linkNode.hostname.match(/([a-z]+)\.wiki.*/i);
        lang = matches[1];
      } else {
        // URL is like: https://en.wikipedia.org/wiki/Foo
        matches = wikiUrl.match(/:\/\/([a-z]+).wikipedia.org\/wiki\/(.*)/i);
        lang = matches[1];
        title = matches[2];
      }

      parts = [this.url, lang, 'whocolor/v1.0.0-beta', title]; // Add oldid if it's present.

      oldId = this.getQueryParameter(queryString, 'oldid');

      if (oldId) {
        parts.push(oldId);
      } // Compile the full URL.


      return parts.join('/') + '/';
    }
    /**
     * Get the WhoColor data for a given wiki page.
     *
<<<<<<< HEAD
     * @param  {string} wikiUrl URL of the wiki page that we want to analyze.
     * @return {Promise}
=======
     * @param {string} url The wiki page's full URL.
     * @return {Promise|PromiseLike<any>|Promise<any>|*}
>>>>>>> Convert to ES6 and add mocha tests and babel to build steps
     */

  }, {
    key: "getData",
    value: function getData(wikiUrl) {
      return $.getJSON(this.getAjaxURL(wikiUrl));
    }
  }]);

  return Api;
}();

var _default = Api;
exports["default"] = _default;

},{}],2:[function(require,module,exports){
"use strict";

var _config = _interopRequireDefault(require("./config"));

var _Api = _interopRequireDefault(require("./Api"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// eslint-disable-next-line no-unused-vars
var a = new _Api["default"]({
  url: _config["default"].wikicolorUrl
}); // Test
// TEST!

OO.ui.alert('The extension is working! URL: ' + a.getAjaxURL(window.location.href));

},{"./Api":1,"./config":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
<<<<<<< HEAD
var config = {
  wikicolorUrl: 'https://www.wikiwho.net/'
};
var _default = config;
=======

var _default = config = {
  wikicolorUrl: 'https://www.wikiwho.net/'
};

>>>>>>> Convert to ES6 and add mocha tests and babel to build steps
exports["default"] = _default;

},{}]},{},[2]);


			} );
		}


	}

	var q = window.RLQ || ( window.RLQ = [] );
	q.push( [ [ 'jquery', 'mediawiki.base', 'mediawiki.jqueryMsg' ], loadWhoWroteThat ] );

}() );
