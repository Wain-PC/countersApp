Accounts.validateNewUser(function (user) {
    var loggedInUser = Meteor.user();

    if (Roles.userIsInRole(loggedInUser, ['admin'])) {
        return true;
    }

    throw new Meteor.Error(403, "Вы не можете создавать новых пользователей!");
});