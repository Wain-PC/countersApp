Template.rowEdit.helpers({
    getMonthYear: function () {
        var date = moment(this.month + '-' + this.year, 'M-YYYY');
        date = date.format('MMMM YYYY');
        return date.charAt(0).toUpperCase() + date.slice(1);
    }
});

Template.rowEdit.events({
    'click span.check': CommonEvents.toggleElectricityDirect
});