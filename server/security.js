//если никого нет, создадим админа
if (Meteor.users.find().count() === 0) {
    var userId = Accounts.createUser({
        email: 'admin@des17.ru',
        password: 'admin'
    });
    Roles.addUsersToRoles(userId,'admin');
}

Accounts.validateNewUser(function (user) {
    var loggedInUser = Meteor.user();

    if (Roles.userIsInRole(loggedInUser, ['admin'])) {
        return true;
    }

    throw new Meteor.Error(403, "Вы не можете создавать новых пользователей!");
});