// ui/shop.js
var Shop = {
    modalElement: null,
    closeButton: null,
    itemsElement: null,
    hoursMsgElement: null,

    shopOpenHour: 9,
    shopCloseHour: 18,

    items: [
        { name: 'Synth-Meal Ration', price: 10 },
        { name: 'Stim-Pack', price: 25 },
        { name: 'Data-Chip (Encrypted)', price: 50 }
    ],

    init: function() {
        this.modalElement = document.getElementById('shop-modal');
        this.closeButton = this.modalElement.querySelector('.close-btn');
        this.itemsElement = this.modalElement.querySelector('#shop-items');
        this.hoursMsgElement = this.modalElement.querySelector('#shop-hours-msg');

        var shopButton = document.getElementById('shop-btn');
        if (shopButton) {
            shopButton.addEventListener('click', this.open.bind(this));
        }
        this.closeButton.addEventListener('click', this.close.bind(this));

        bootlog.log('Shop system initialized.');
    },

    isOpen: function() {
        var currentHour = Time.hour;
        return currentHour >= this.shopOpenHour && currentHour < this.shopCloseHour;
    },

    open: function() {
        if (this.isOpen()) {
            this.hoursMsgElement.textContent = 'Open until ' + this.shopCloseHour + ':00. Welcome!';
            this.populateItems();
        } else {
            this.hoursMsgElement.textContent = 'Sorry, we are closed. Our hours are ' + this.shopOpenHour + ':00 - ' + this.shopCloseHour + ':00.';
            this.itemsElement.innerHTML = '';
        }
        this.modalElement.hidden = false;
    },

    close: function() {
        this.modalElement.hidden = true;
    },

    populateItems: function() {
        var html = '';
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            html += '<li>' + item.name + ' - ' + item.price + ' credits</li>';
        }
        this.itemsElement.innerHTML = html;
    }
};
