CommonEvents = {
    toggleElectricityDirect: function(event) {
        setTimeout(function() {
            var checkbox = $('form input[name="electricity_direct"]');
            var field = $('form input[name="electricity"]');
            if(checkbox.is(':checked')) {
                $('form input[name="electricity"]').slideUp();
            }
            else {
                $('form input[name="electricity"]').slideDown();
            }
        }, 300);
    }
};

CommonHelpers = {
    capitalize: function(input) {
        return input.charAt(0).toUpperCase() + input.slice(1)
    },
    monthsForSelect: function () {
        return _.map(moment.months(), function(monthName, i) {
            return {label: CommonHelpers.capitalize(monthName), value: i+1};
        })
    },
    getMonthCaption: function (monthId) {
        return this.capitalize(moment.months()[monthId-1]);
    }
};