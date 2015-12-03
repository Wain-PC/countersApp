Template.afCheckbox_mine.helpers({
    getCheckedValue: function () {
        if(this.value) {
            return 'checked';
        }
    },
    getLabel: function (name) {
        var value = Blaze._globalHelpers.afFieldLabelText(name);
        if(value) {
            return value;
        }
        return this.atts.label;
    }
});