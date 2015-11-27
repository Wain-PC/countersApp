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
            var updateObj = [{userId: doc.userId, month: doc.month, year: doc.year}, {
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
        return Rows.findOne({userId: doc.userId, month: doc.month, year: doc.year});
    },

    'rowsList': function () {
        return Rows.find({userId: this.userId});
    },

    passwordGenerate: function () {
        var generatePassword = Meteor.npmRequire('password-generator');
        var pass = generatePassword();
        console.log(pass);
        return pass;
    },

    'adm_userAdd': function (doc) {
        //добавление пользователей доступно только администратору
        check(doc, Schemas.addUser);
        if (!Roles.userIsInRole(this.userId, ['admin'])) {
            notifyClient({
                type: 'error',
                title: 'Ошибка доступа!',
                message: 'Для добавления пользователей нужны права администратора.'
            });
        }

        result = Accounts.createUser({
            email: doc.email,
            password: doc.password,
            flatNumber: doc.flatNumber
        });
        console.log("User creation result: %s", result);
        if(!result) {
            notifyClient({
                type: 'error',
                title: 'Ошибка создания пользователя!',
                message: error
            });
        }
        else {
            notifyClient({
                type: 'success',
                title: 'Пользователь ' + doc.email + ' создан успешно'
            });
        }


    },

    'adm_checkMail': function() {
        return Async.runSync(function (done) {
            //do all async stuff
            Mail.imap.once('ready', function() {
                Mail.imap.openBox('ПОКАЗАНИЯ СЧЕТЧИКОВ', true, function(err, box) {
                    var mailCounter = 0;
                    if (err) throw err;
                    console.log(box);

                    var f = Mail.imap.seq.fetch(box.messages.total + ':*', {
                        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
                        struct: true
                    });

                    f.on('message', function(msg, seqno) {
                        var prefix = '(#' + seqno + ') ';
                        console.log(prefix);
                        msg.on('body', function(stream, info) {
                            var buffer = '';
                            stream.on('data', function(chunk) {
                                buffer += chunk.toString('utf8');
                            });
                            stream.once('end', function() {
                                var message = Mail.Imap.parseHeader(buffer);
                                var messageString = Mail.inspect(Mail.Imap.parseHeader(buffer));
                                console.log('-------------------------');
                                console.log(prefix);
                                console.log(messageString);
                                mailCounter++;

                            });
                        });
                        msg.once('attributes', function(attrs) {
                            //console.log(prefix + 'Attributes: %s', Mail.inspect(attrs, false, 8));
                        });
                        msg.once('end', function() {
                            console.log(prefix + 'Parsed');
                        });
                    });
                    f.once('error', function(err) {
                        var result = -1;
                        console.log('Fetch error: ' + err);
                        if(done) {
                            done(err,result)
                        }
                    });
                    f.once('end', function() {
                        console.log('Done fetching all messages!');
                        Mail.imap.end();
                        if(done) {
                            done(null,mailCounter);
                        }
                    });

                });
            });
            Mail.imap.once('error', function(err) {
                console.log(err);
            });
            Mail.imap.once('end', function() {
                console.log('Connection ended');
            });
            Mail.imap.connect();
        });
    }
});


function notifyClient(params) {
    throw new Meteor.Error(params.type || 'info', params.title || '', {message: params.message || '', options:  params.options || {}});
}