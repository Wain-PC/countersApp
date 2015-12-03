 Template.login.events({
        'submit form': function(event) {
            event.preventDefault();
            var login, password,
                loginValue, passwordValue;
            login = event.target[0].value;
            password = event.target[1].value;
            Session.set('latestLogin', login);
            Meteor.loginWithPassword(login, password, function(err) {
                if(!err) {
                    Router.go('rows.list');
                    return;
                }
                Notifications.error('Ошибка входа', 'Введен неверный логин или пароль', {
                    timeout: 5000
                });
            });
        },

        'click #form-signin-try': function(event) {
            event.preventDefault();
            var login, password;
            login = 'demo@demo.demo';
            password = 'demopass';
            Meteor.loginWithPassword(login, password, function(err) {
                if(!err) {
                    Router.go('rows.list');
                    return;
                }
                Notifications.error('Ошибка входа', 'Введен неверный логин или пароль');
            });
        }
    });

    Template.login.helpers({
        getLatestLogin: function() {
            var latestLogin = Session.get('latestLogin');
            if(!latestLogin) return '';
            $('#form-signin input[name="password"]').focus();
            return latestLogin;
        }
    });

    Template.login.onRendered(function() {
        var latestLogin = Session.get('latestLogin');
        if(latestLogin) {
            $('#form-signin input').first().val(latestLogin);
            $('#form-signin input').last().focus();
            return;
        }
        $('#form-signin input').first().focus();
    })