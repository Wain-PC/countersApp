Meteor.publish('rows', function() {
    if(Roles.userIsInRole(this.userId,'admin')) {
        return Rows.find({});
    }
    return Rows.find({userId: this.userId});
});