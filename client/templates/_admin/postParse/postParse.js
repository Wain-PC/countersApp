Template.adminPostparse.events({
    'click button#postParse': function (event) {
        event.preventDefault();
        var button = $(event.target);
        button.attr('disabled','disabled');
        console.log("Btn disabled");
        var generatedPassword = Meteor.call('adm_checkMail', function (error, result) {
            if(error || result.error) {
                Notifications.error('Ошибка обработки почты', error || result.error, {timeout: 7000});
            }
            else {
                Notifications.success('Почта обработана успешно',
                    "Получено "+ result.result + " новых сообщений",
                    {timeout: 5000});
            }
            button.removeAttr('disabled');
        });
    }
});