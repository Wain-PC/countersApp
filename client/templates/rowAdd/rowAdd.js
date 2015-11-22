Template.rowAdd.helpers({
    getCurrentYear: function () {
        return new Date().getFullYear();
    }
});

AutoForm.addHooks('insertRowForm', AutoFormHooks.getServerMessage);

Template.rowAdd.events({
    'click span.check': CommonEvents.toggleElectricityDirect
});