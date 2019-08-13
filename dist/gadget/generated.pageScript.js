( function () {
	var languageJson = {"en":{"ext-whowrotethat-activation-link":"Who Wrote That?","ext-whowrotethat-activation-link-tooltip":"Activate Who Wrote That?","ext-whowrotethat-state-pending":"<strong><em>Who Wrote That?</em></strong> is loading. This might take a while","ext-whowrotethat-state-error":"Error: $1","ext-whowrotethat-state-error-generic":"Could not load WhoWroteThat. Please refresh and try again.","ext-whowrotethat-ready-title":"Who Wrote That?","ext-whowrotethat-ready-general":"Hover to see contributions by the same author. Click for more details."}};
	function loadWhoWroteThat() {
		// eslint-disable-next-line no-unused-vars
var wwtActivationSingleton = ( function () {
	var $parserOutput = $( '.mw-parser-output' ),
		$parserOutputStored = $parserOutput.clone(),
		interfaceLang = $( 'html' ).attr( 'lang' ),
		/**
		 * Initialize the activation button to toggle WhoWroteThat system.
		 * Only attaches the button for pages in the main namespace, and only
		 * in view mode.
		 *
		 * @param  {[type]} allTranslations An object representing all available
		 *  translations, keyed by language code.
		 * @param  {[type]} onClickFunction The function that is triggered when
		 *  the activation button is clicked.
		 */
		initialize = function ( allTranslations, onClickFunction ) {
			var link;

			// Load all messages
			mw.messages.set(
				$.extend( {},
					// Manually create fallback on English
					allTranslations.en,
					allTranslations[ interfaceLang ]
				)
			);

			// Add a portlet link to 'tools'
			link = mw.util.addPortletLink(
				'p-tb',
				'#',
				mw.msg( 'ext-whowrotethat-activation-link' ),
				't-whowrotethat',
				mw.msg( 'ext-whowrotethat-activation-link-tooltip' )
			);

			// Attach event
			$( link ).on( 'click', onClickFunction );

			// Store original DOM
			$( 'body' ).data( 'wwt-originalOutput', $parserOutput.clone() );
		};

	return {
		/**
		 * Get the original html of the article, for the purposes of toggling
		 * the system on and off.
		 *
		 * @return {jQuery} Content node
		 */
		getOriginalHTML: function () {
			return $parserOutputStored;
		},
		initialize: function ( translations, onClickFunction ) {
			// Bail out if we're anywhere that is not an article page in read mode
			if (
				// Initialization already happened
				$parserOutput.data( 'wwt-originalOutput' ) ||
				// Does not have the needed parser content
				!$parserOutput.length ||
				// Not main namespace
				mw.config.get( 'wgCanonicalNamespace' ) !== '' ||
				// Is main page
				mw.config.get( 'wgIsMainPage' )
			) {
				return;
			}

			// Otherwise, initialize
			initialize( translations, onClickFunction );
		}
	};
}() );


		// Initialize
		wwtActivationSingleton.initialize( languageJson, onActivateButtonClick );

		function onActivateButtonClick( e ) {
			mw.loader.using( [ 'oojs-ui', 'oojs-ui.styles.icons-user', 'oojs-ui.styles.icons-interactions' ] ).then( function () {

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Interface to the [WikiWho](https://www.wikiwho.net/) WhoColor API.
 *
 * @class
 */
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
   * Get the value of a parameter from the given URL query string.
   *
   * @protected
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
     * Get a WhoColor API URL based on a given wiki URL.
     *
     * @param  {string} wikiUrl URL of the wiki page that we want to analyze.
     * @return {string} Ajax URL for the data from WhoColor.
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
     * @param  {string} wikiUrl URL of the wiki page that we want to analyze.
     * @return {Promise}
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var InfoBarWidget = function InfoBarWidget() {
  var _this = this;

  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // Parent constructor
  OO.ui.ButtonWidget.parent.call(this, config);
  OO.ui.mixin.IconElement.call(this, config);
  OO.ui.mixin.LabelElement.call(this, config);
  OO.ui.mixin.TitledElement.call(this, config);
  OO.ui.mixin.FlaggedElement.call(this, config);
  this.closeIcon = new OO.ui.IconWidget({
    icon: 'clear',
    flags: ['invert'],
    classes: ['ext-wwt-infoBarWidget-close']
  });
  this.userInfoLabel = new OO.ui.LabelWidget({
    label: mw.msg('ext-whowrotethat-ready-general'),
    classes: ['ext-wwt-infoBarWidget-info']
  });
  this.$pendingAnimation = $('<div>').addClass('ext-wwt-infoBarWidget-spinner').append($('<div>').addClass('ext-wwt-infoBarWidget-spinner-bounce')); // Set properties

  this.setState(config.state || 'pending');
  this.setLabel($('<span>').append(mw.msg('ext-whowrotethat-state-pending')).contents()); // Close event

  this.closeIcon.$element.on('click', function () {
    return _this.emit('close');
  }); // Initialize

  this.$element.addClass('ext-wwt-infoBarWidget').append(this.$pendingAnimation, this.$icon, this.$label, this.userInfoLabel.$element, this.closeIcon.$element);
};
/* Setup */


OO.inheritClass(InfoBarWidget, OO.ui.Widget);
OO.mixinClass(InfoBarWidget, OO.ui.mixin.IconElement);
OO.mixinClass(InfoBarWidget, OO.ui.mixin.LabelElement);
OO.mixinClass(InfoBarWidget, OO.ui.mixin.TitledElement);
OO.mixinClass(InfoBarWidget, OO.ui.mixin.FlaggedElement);
/**
 * Define legal states for the widget
 *
 * @type {Array}
 */

InfoBarWidget["static"].legalFlags = ['pending', 'ready', 'err'];
/**
 * Change the state of the widget
 *
 * @param {string} state Widget state; 'pending', 'ready' or 'error'
 */

InfoBarWidget.prototype.setState = function (state) {
  var flags = {};

  if (this.state !== state) {
    this.constructor["static"].legalFlags.forEach(function (flag) {
      flags[flag] = flag === state;
    });
    flags.invert = true;
    this.setFlags(flags);

    if (state === 'ready') {
      this.setLabel($('<span>').append(mw.msg('ext-whowrotethat-ready-title')).contents());
      this.userInfoLabel.setLabel($('<span>').append(mw.msg('ext-whowrotethat-ready-general')).contents());
      this.setIcon('userAvatar');
    } else if (state === 'pending') {
      this.setIcon('');
    } else {
      this.setIcon('error');
      this.setErrorMessage();
    }

    this.$pendingAnimation.toggle(state === 'pending');
    this.userInfoLabel.toggle(state === 'ready');
    this.closeIcon.toggle(state !== 'pending');
    this.state = state;
  }
};
/**
 * Set an error with a specific label
 *
 * @param {string} message Error label message key
 */


InfoBarWidget.prototype.setErrorMessage = function () {
  var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'ext-whowrotethat-state-error-generic';
  this.setLabel(mw.msg('ext-whowrotethat-state-error', mw.msg(message)));
};

var _default = InfoBarWidget;
exports["default"] = _default;

},{}],3:[function(require,module,exports){
"use strict";

var _config = _interopRequireDefault(require("./config"));

var _Api = _interopRequireDefault(require("./Api"));

var _InfoBarWidget = _interopRequireDefault(require("./InfoBarWidget"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var components = $('body').data('wwt-components'); // Initialize

if (!components) {
  // Store, so we don't append and create objects if they've been created
  // TODO: We could potentially store all that data in some view model that's shared
  // across the widgets.
  components = {
    widget: new _InfoBarWidget["default"](),
    api: new _Api["default"]({
      url: _config["default"].wikicolorUrl
    }),
    $originalOutput: $('body').data('wwt-originalOutput')
  };
  $('body').data('wwt-components', components);

  if ($('body').hasClass('skin-timeless')) {
    $('#mw-content-wrapper').prepend(components.widget.$element);
  } else {
    $('#content').prepend(components.widget.$element);
  }
}

components.widget.toggle(true);
components.widget.setState('pending');
components.widget.on('close', function () {
  // Close button; revert back to the original content
  // $( '.mw-parser-output' ).empty().append( components.$originalOutput );
  // Hide the widget
  components.widget.toggle(false);
});

},{"./Api":1,"./InfoBarWidget":2,"./config":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var config = {
  wikicolorUrl: 'https://www.wikiwho.net/'
};
var _default = config;
exports["default"] = _default;

},{}]},{},[3]);


			} );

			e.preventDefault();
			return false;
		}


	}

	$( document ).ready( loadWhoWroteThat );
}() );
