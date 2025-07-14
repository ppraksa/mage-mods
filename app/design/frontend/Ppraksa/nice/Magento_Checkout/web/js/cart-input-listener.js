define([
    'jquery',
    'Magento_Checkout/js/action/get-totals',
    'Magento_Customer/js/customer-data'
], function ($, getTotalsAction, customerData) {
    'use strict';

    /**
     * This script listens for changes in the quantity input fields of the cart
     */
    $(document).on('change', 'input[name$="[qty]"]', function () {
        const FORM_ID = '#form-validate';
        let form = $(`form${FORM_ID}`)[0];

        if (!form) {
            console.error(`Form ${FORM_ID} not found`);

            return false;
        }

        let { action: url } = form;
        let formData = new FormData(form);

        $('body').loader('show');

        fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('Error during the processing: ' + response.statusText);
            }

            return response.text();
        }).then(function (html) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
            let newFormValidate = doc.querySelector(`${FORM_ID}`);

            if (newFormValidate) {
                $('#form-validate').replaceWith(newFormValidate.outerHTML);
            } else {
                console.warn(`there is no form ${FORM_ID} in the response`);
            }

            let sections = ['cart'];
            let deferred = $.Deferred();

            // reload customer data and totals
            customerData.reload(sections, true);
            getTotalsAction([], deferred);

            $('body').loader('hide');

            return deferred.promise();
        }).catch(function (error) {
            console.error('Error occurred:', error);
            $('body').loader('hide');
        });
    });
});
