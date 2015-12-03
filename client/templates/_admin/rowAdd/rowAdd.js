Template.adminRowadd.helpers({
    getCurrentYear: function () {
        return new Date().getFullYear();
    },
    getUsersForSelect: function () {
        return Meteor.users.find().fetch().map(function (currentValue, index, array) {
            return {
                label: currentValue.emails[0].address,
                value: currentValue._id
            }
        })
    }
});

Template.rowAdd.events({
    'click span.check': CommonEvents.toggleElectricityDirect
});