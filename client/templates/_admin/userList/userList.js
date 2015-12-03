Template.adminUserlistCheckbox.helpers({
    isAdministrator: function(_id) {
        return Roles.userIsInRole(_id, 'admin');
    }
});