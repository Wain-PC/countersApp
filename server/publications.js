Meteor.publish('rows', function() {
    return Rows.find({userId: this.userId});
});