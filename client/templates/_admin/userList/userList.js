Template.adminUserlistCheckbox.helpers({
    isAdministrator: function(_id) {
        return Roles.userIsInRole(_id, 'admin');
    }
});

Template.adminUserlistUserViewLink.helpers({
    getEmail: function() {
        return this.emails[0].address;
    }
});