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
