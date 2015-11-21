AutoForm.setDefaultTemplateForType('afCheckbox', 'mine');

Template.rowAdd.helpers({
    getCurrentYear: function () {
        return new Date().getFullYear();
    }
});