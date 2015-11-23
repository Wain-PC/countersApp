AutoForm.addHooks('adminUseraddForm', AutoFormHooks.getServerMessage);


Template.adminUseradd.helpers({
    userAddSchema: function() {
        return Schemas.User;
    }
});