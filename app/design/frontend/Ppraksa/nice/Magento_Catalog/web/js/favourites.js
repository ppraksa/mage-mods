define([
    'uiComponent',
    'ko',
    'mage/translate',
    'Magento_Customer/js/customer-data'
], function (Component, ko, $t, customerData) {
    'use strict';

    const LOCAL_STORAGE_KEY = 'favourites';

    return Component.extend({
        defaults: {
            template: 'Magento_Catalog/favourites-button',
            sku: null,
            checked: false,
            buttonText: '',
            addToText: $t('Add to Favourites'),
            removeFromText: $t('Remove from Favourites')
        },

        /**
         * Initialize observable properties
         *
         * @return {this}
         */
        initObservable: function () {
            this._super().observe([
                'checked',
                'sku',
                'buttonText'
            ]);

            return this;
        },

        /**
         * Init function
         *
         * @param config
         */
        initialize: function (config) {
            this._super();

            this.sku(config?.sku);
            this.isInLocalStorage(this.sku()) ? this.checked(true) : this.checked(false);
            this.toggleBtnTxt();
        },

        /**
         * Toggle favourite status
         * 
         * @return {void}
         */
        toggleFavourite: function () {
            this.checked(!this.checked());
            this.toggleBtnTxt();
            this.saveFavourites(this.sku(), this.checked());
            this.showMessage();
        },

        /**
         * Toggle text on the button
         * 
         * @return {void}
         */
        toggleBtnTxt: function () {
            this.buttonText(this.checked() ? this.removeFromText : this.addToText);
        },

        /**
         * Save favourites to local storage
         *
         * @param sku
         * @param isAdding
         * @return {void}
         */
        saveFavourites: function (sku, isAdding) {
            let store = this.getFromStorage();
            store.favourites = store.favourites || [];

            if (isAdding && !store.favourites.includes(sku)) {
                store.favourites.push(sku);
            } else if (!isAdding) {
                store.favourites = store.favourites.filter(s => s !== sku);
            }

            const newEncoded = btoa(JSON.stringify(store));

            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, newEncoded);
            } catch (e) {
                console.warn(e);
            }
        },

        /**
         * Get favourites from local storage
         *
         * @return {object}
         */
        getFromStorage: function () {
            const encoded = localStorage.getItem(LOCAL_STORAGE_KEY);

            return JSON.parse(atob(encoded)) || {};
        },

        /**
         * Check if item is in favourites
         *
         * @param {string} sku
         * @return {boolean}
         */
        isInLocalStorage: function (sku) {
            const store = this.getFromStorage();

            return store.favourites && store.favourites.includes(sku);
        },

        /**
         * Show success message after adding/removing from favourites
         * 
         * @return {void}
         * */
        showMessage: function () {
            const message = this.checked()
                ? $t('Product has been added to Favourites')
                : $t('Product has been removed from Favourites');

            customerData.set('messages', {
                messages: [{
                    type: 'success',
                    text: message
                }]
            });
        }
    });
});
