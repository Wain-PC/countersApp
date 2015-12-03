Template.afCheckbox_mine.helpers({
    getCheckedValue: function () {
        if(this.value) {
            return 'checked';
        }
    },
    getLabel: function (name) {
        console.log(this, arguments);
        var value = Blaze._globalHelpers.afFieldLabelText(name);
        console.log(value);
        if(value) {
            return value;
        }
        return this.atts.label;
    }
});