if (Meteor.isClient) {
    Template.login.events({
        'submit #login_form': function(event) {
            event.preventDefault();
            var login, password;
            login = event.target[0].value;
            password = event.target[1].value;
            console.log(login, password);
            Meteor.loginWithPassword(login, password, function(err) {
                console.log(err);
                if(!err) {
                    Router.go('rowsList');
                    return;
                }
                else {
                    Notifications.warn('title', 'message');
                }
            });
        }
    });
}