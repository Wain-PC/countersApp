Template.adminUserview.helpers({
    userSelector: function () {
        return {userId: this._id}
    },
    getEmail: function () {
        if(this.emails && this.emails[0]) return this.emails[0].address;
        return '';
    }
});