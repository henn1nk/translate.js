/**
 * Microlib for translations with support for placeholders and multiple plural forms.
 *
 * v0.0.1
 *
 * Usage:
 * var yourTranslationsObject = {
 *   translationKey: 'translationValue'
 * }
 *
 * var t = tinyTranslate.getTranslationFunction(yourTranslationsObject, debugModeBoolean)
 *
 * t('translationKey')
 * t('translationKey', 2)
 * t('translationKey', {replaceKey: 'replacevalue'})
 * t('translationKey', 2, {replaceKey: 'replacevalue'})
 * t('moduleA.translationKey')
 *
 *
 * @author Jonas Girnatis <dermusterknabe@gmail.com>
 * @licence May be freely distributed under the MIT license.
 */

/*global window, console */
;(function () {
    'use strict';

    var isNumeric = function(obj) { return !isNaN(parseFloat(obj)) && isFinite(obj); };
    var isObject = function(obj) { return typeof obj === 'object' && obj !== null; };
    var isString = function(obj) { return Object.prototype.toString.call(obj) === '[object String]'; };

    window.tinyTranslate = {
        getTranslationFunction: function(messageObject, debug) {
            function getTranslationValue(translationKey) {
                if(messageObject[translationKey]) {
                    return messageObject[translationKey];
                }

                var components = translationKey.split('::'); //@todo make this more robust. maybe support more levels?
                var namespace = components[0];
                var key = components[1];
             
                if(messageObject[namespace] && messageObject[namespace][key]) {
                    return messageObject[namespace][key];
                }

                return null;
            }

            function getPluralValue(translation, count) {
                if (isObject(translation)) {
                    if(Object.keys(translation).length === 0) {
                        debug && console.log('[Translation] No plural forms found.');
                        return null;
                    }

                    if(translation[count]){
                        translation = translation[count];
                    } else if(translation.n) {
                        translation = translation.n;
                    } else {
                        debug && console.log('[Translation] No plural forms found for count:"' + count + '" in', translation);
                        translation = translation[Object.keys(translation).reverse()[0]];
                    }
                }

                return translation;
            }

            function replacePlaceholders(translation, replacements) {
                if (isString(translation)) {
                    return translation.replace(/\{(\w*)\}/g, function (match, key) {
                        if(!replacements.hasOwnProperty(key)) {
                            debug && console.log('Could not find replacement "' + key + '" in provided replacements object:', replacements);

                            return '{' + key + '}';
                        }

                        return replacements.hasOwnProperty(key) ? replacements[key] : key;
                    });
                }

                return translation;
            }

            return function (translationKey) {
                var replacements = isObject(arguments[1]) ? arguments[1] : (isObject(arguments[2]) ? arguments[2] : {});
                var count = isNumeric(arguments[1]) ? arguments[1] : (isNumeric(arguments[2]) ? arguments[2] : null);

                var translation = getTranslationValue(translationKey);

                if (count !== null) {
                    replacements.n = replacements.n ? replacements.n : count;

                    //get appropriate plural translation string
                    translation = getPluralValue(translation, count);
                }

                //replace {placeholders}
                translation = replacePlaceholders(translation, replacements);

                if (translation === null) {
                    debug && console.log('Translation for "' + translationKey + '" not found.');
                    return '@@' + translationKey + '@@';
                }

                return translation;
            };
        }
    };
})();