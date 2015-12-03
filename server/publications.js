Meteor.publish('rows', function() {
    if(Roles.userIsInRole(this.userId,'admin')) {
        return Rows.find({});
    }
    return Rows.find({userId: this.userId});
});

Meteor.publish('users', function() {
    if(Roles.userIsInRole(this.userId,'admin')) {
        return Meteor.users.find({});
    }
    return Meteor.users.find({userId: this.userId});
});