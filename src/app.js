import config from './config';
import Api from './Api';

// eslint-disable-next-line no-unused-vars
const a = new Api( { url: config.wikicolorUrl } ); // Test
// TEST!
OO.ui.alert( 'The extension is working! URL: ' + a.getAjaxURL( window.location.href ) );
