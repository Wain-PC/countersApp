Template.adminUseradd.helpers({
    userAddSchema: function() {
        return Schemas.addUser;
    }
});

Template.adminUseradd.events({
    'click button#passwordGenerate': function () {
        event.preventDefault();
        var generatedPassword = Meteor.call('passwordGenerate', function (error, result) {
            if(result) {
                $('#adminUseraddForm input[name="password"]').val(result);
            }
        });
    }
});

Template.adminUseradd.onRendered(function () {
    // Use the Packery jQuery plugin
    $('button#passwordGenerate').click();
});