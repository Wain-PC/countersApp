Template.rowAdd.helpers({
    getCurrentYear: function () {
        return new Date().getFullYear();
    }
});

Template.rowAdd.events({
    'click span.check': CommonEvents.toggleElectricityDirect
});