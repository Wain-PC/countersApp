if(Meteor.isServer) {
    Meteor.publish('rows', function() {
        console.log(Rows.find().count());
        return Rows.find({},{
            sort: {createdAt: -1}
        });
    });
}
else if(Meteor.isClient) {
    //console.log("Subscribed on client!");
    Meteor.subscribe('rows');
}
else {
    console.log("WHO THE FUCK AM I?");
}