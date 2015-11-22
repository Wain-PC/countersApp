Meteor.methods({
    //a method for adding new row
    'rowAdd': function (doc) {
        check(doc, Schemas.Row);
        var userId = this.userId,
            existingRow,
            tomorrowDate, thenDate;

        //проверим, что этот пользователь уже загружал показания на сервер.
        existingRow = Meteor.call('checkExistingRow', doc);
        //если это так, нужно определить, доступна ли ему возможность редактирования показаний
        //в случае, если за эту дату показания еще не загружались, загрузим их
        if (!existingRow) {
            Rows.insert(doc);
            notifyClient({
                type: 'success',
                title: 'Показания успешно добавлены!'
            });
        }
        //показания найдены. Определим, может ли пользователь их редактировать.
        //Редактирование показаний доступно только в первые сутки после их добавления
        tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        thenDate = existingRow.createdAt;
        if (+tomorrowDate > +thenDate) {
            notifyClient({
                type: 'info',
                title: 'Внимание!',
                message: 'Показания за этот месяц уже существуют!' +
                'Вы были перенаправлены на страницу редактирования показаний',
                options: {
                    timeout: 10000,
                    redirect: existingRow._id
                }
            });
        }
        else {
            notifyClient({
                type: 'error',
                title: 'Внимание!',
                message: 'Показания за этот месяц уже существуют!' +
            'Изменение этих показаний недоступно, поскольку с момента их внесения прошло более 24 часов'
            });
        }


    },

    'rowEdit': function (doc) {
        check(doc, Schemas.Row);
        var userId = this.userId,
            existingRow,
            tomorrowDate, thenDate;

        //проверим, что этот пользователь уже загружал показания на сервер.
        existingRow = Meteor.call('checkExistingRow', doc);
        //если это так, нужно определить, доступна ли ему возможность редактирования показаний
        //в случае, если за эту дату показания еще не загружались, загрузим их
        if (!existingRow) {
            notifyClient({
                type: 'error',
                title: 'Ошибка',
                message: 'Показаний, которые Вы редактируете, не существует'
            });
        }
        //показания найдены. Определим, может ли пользователь их редактировать.
        //Редактирование показаний доступно только в первые сутки после их добавления
        tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        thenDate = existingRow.createdAt;
        if (+tomorrowDate > +thenDate) {
            var updateObj = [{month: doc.month, year: doc.year}, {
                $set: {
                    coldwater1: doc.coldwater1,
                    coldwater2: doc.coldwater2,
                    hotwater1: doc.hotwater1,
                    hotwater2: doc.hotwater2,
                    electricity: doc.electricity,
                    electricity_direct: doc.electricity_direct,
                    comment: doc.comment
                }
            }, {
                upsert: false,
                multi: false
            }];
            var updateResult = Rows.update.apply(Rows, updateObj);
            if(updateResult) {
                notifyClient({
                    type: 'info',
                    title: 'Показания успешно изменены!',
                    message: 'Обратите внимание, что Вы не сможете отредактировать показания через '+ moment(tomorrowDate).toNow(true)
                });
            }
            else {
                notifyClient({
                    type: 'error',
                    title: 'Ошибка!',
                    message: 'Во время изменения показаний произошла ошибка. Показания не были изменены'
                });
            }
        }
        else {
            notifyClient({
                type: 'error',
                title: 'Ошибка!',
                message: 'Изменение показаний недоступно, поскольку с момента их добавления прошло более 24 часов'
            });
        }


    },

    'checkExistingRow': function (doc) {
        check(doc, Schemas.Row);
        return Rows.findOne({month: doc.month, year: doc.year});
    },

    'rowsList': function () {
        return Rows.find({userId: this.userId});
    }
});


function notifyClient(params) {
    throw new Meteor.Error(params.type || 'info', params.title || '', {message: params.message || '', options:  params.options || {}});
}