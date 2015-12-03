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
            return;
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
            return;
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
            if (updateResult) {
                notifyClient({
                    type: 'info',
                    title: 'Показания успешно изменены!',
                    message: 'Обратите внимание, что Вы не сможете отредактировать показания через ' + moment(tomorrowDate).toNow(true)
                });
            }
            else {
                notifyClient({
                    type: 'error',
                    title: 'Ошибка!',
                    message: 'Во время изменения показаний произошла ошибка. Показания не были изменены'
                });
                return;
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

    'passwordGenerate': function () {
        var generatePassword = Meteor.npmRequire('password-generator');
        var pass = generatePassword();
        //console.log(pass);
        return pass;
    },

    'adm_checkUserByEmail': function (userEmail) {
        if (!Roles.userIsInRole(this.userId, ['admin'])) {
            notifyClient({
                type: 'error',
                title: 'Ошибка доступа!',
                message: 'Для вызова этой процедуры необходимы права администратора'
            });
            return;
        }
        check(userEmail, String);
        var result = Meteor.users.findOne({"emails.address": userEmail});
        if (result) {
            return result._id;
        }
        return null;
    },

    'adm_userAdd': function (doc) {
        //console.log("Creating user", doc);
        //добавление пользователей доступно только администратору
        check(doc, Schemas.addUser);
        if (!Roles.userIsInRole(this.userId, ['admin'])) {
            notifyClient({
                type: 'error',
                title: 'Ошибка доступа!',
                message: 'Для добавления пользователей нужны права администратора.'
            });
            return;
        }

        var userId = Meteor.call('adm_checkUserByEmail', doc.email);
        if (userId) {
            return userId;
        }

        userId = Accounts.createUser({
            email: doc.email,
            password: doc.password
        });

        if (!userId) {
            notifyClient({
                type: 'error',
                title: 'Ошибка создания пользователя!',
                message: error
            });
        }
        else {
            //пользователя создали, добавим к нему вспомогательные данные (№ квартиры и роли)
            var addedProperties = {
                flatNumber: doc.flatNumber
            };
            check(addedProperties, {
                flatNumber: Number
            });
            Meteor.users.update({_id: userId}, {$set: addedProperties});
            if (doc.isAdmin) {
                check(userId, String);
                Meteor.call('adm_setAdmin', userId, true);
            }

            notifyClient({
                type: 'success',
                title: 'Пользователь ' + doc.email + ' создан успешно'
            });
        }
        return userId;
    },

    'adm_setAdmin': function (userId, setAdminGrants) {
        if (setAdminGrants) {
            Roles.addUsersToRoles(userId, 'admin');
        }
        else {
            Roles.removeUsersFromRoles(userId, 'admin');
        }

        notifyClient({
            type: 'success',
            title: 'Данные пользователя ' + userId + ' успешно отредактированы'
        });
    },

    'adm_checkMail': function () {
        var result;
        result = Async.runSync(function (done) {
            var mailCounter = 0;
            var Mail = {};
            Mail.mailConfig = {
                user: '***',
                password: '***',
                host: '***',
                port: 993,
                tls: true
            };


            Mail.MailParser = Meteor.npmRequire('mailparser').MailParser;
            Mail.mailParser = new Mail.MailParser();
            Mail.Imap = Meteor.npmRequire('imap');
            Mail.inspect = Meteor.npmRequire('util').inspect;
            Mail.imap = new Mail.Imap(Mail.mailConfig);

            Mail.imap.once('ready', Meteor.bindEnvironment(function () {
                Mail.imap.openBox('ПОКАЗАНИЯ СЧЕТЧИКОВ', true, Meteor.bindEnvironment(function (err, box) {
                    if (err) throw err;

                    var f = Mail.imap.seq.fetch(box.messages.total + ':' + (box.messages.total - 30), {
                        bodies: ''
                    });

                    f.on('message', Meteor.bindEnvironment(function (msg, seqno) {
                        var prefix = '(#' + seqno + ') ';
                        msg.on('body', Meteor.bindEnvironment(function (stream, info) {
                            var buffer = '';
                            stream.on('data', function (chunk) {
                                buffer += chunk.toString('utf8');
                            });
                            stream.once('end', Meteor.bindEnvironment(function () {
                                console.log("----------------" + prefix);
                                var headers = Mail.Imap.parseHeader(buffer),
                                    flatNumber, senderEmail, countersValues,
                                    month, year, date;
                                //please DO NOT LOOK BELOW. These regexps will make ur eyes BLEED and FALL OUT!
                                var regExps = {
                                    //заголовок с месяцем в формате mm-yyyy
                                    header: /^Показания счетчиков (\d{4})-(\d{2}) кв\. (\d+)$/,
                                    //заголовок с месяцем строкой, например "Июнь". В этом случае придется воссоздавать дату с помощью moment
                                    header2: /^Показания счетчиков (\D*?)\d*? кв\. (\d+)$/,
                                    //без тепла
                                    body: /<p>(.+?)<\/p>.+?<\/thead><tr><td>([\d.,]*?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><td>([\d,.]+)\D*?<\/td><tr><table><p>(.*?)<\/p>/,
                                    //с теплом
                                    body2: /<p>(.+?)<\/p>.+?<\/thead><tr><td>([\d.,]*?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><td>([\d.,]+?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><tr><table><p>(.*?)<\/p>/,
                                    //с теплом, но без e-mail. Пользователя придется определять по номеру квартиры
                                    body3: /<\/thead><tr><td>([\d.,]*?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><td>([\d.,]+?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><td>([\d.,]*?)\D*?<\/td><tr><table><p>(.*?)<\/p>/,
                                    isElectricityDirect: /([Дд]оговор|[Пп]рямой)/
                                }, regexpResult;
                                date = new Date(headers.date[0]);
                                regexpResult = regExps.header.exec(headers.subject[0]);
                                if (regexpResult) {
                                    year = Number(regexpResult[1]);
                                    month = Number(regexpResult[2]);
                                    flatNumber = Number(regexpResult[3]);
                                }
                                else {
                                    regexpResult = regExps.header2.exec(headers.subject[0]);
                                    if (regexpResult) {
                                        month = regexpResult[1];
                                        flatNumber = Number(regexpResult[2]);
                                        //теперь будем парсить дату при помощи moment.js
                                        year = date.getFullYear();
                                        month = moment(month + '-' + year, "MMMM-YYYY").month() + 1;
                                    }
                                }
                                //не вышло распарсить сообщение, нужно написать об ошибке и перейти к следующему
                                if (!regexpResult) {
                                    console.log("Cannot parse HEADER for message %s", prefix);
                                    console.log(headers);
                                    return false;
                                }
                                regexpResult = regExps.body.exec(buffer);
                                if (!regexpResult) {
                                    //повторим то же, но с другой регуляркой.
                                    regexpResult = regExps.body2.exec(buffer);
                                }
                                if (!regexpResult) {
                                    //повторим то же, но  регуляркой без почты, а почту постараемся найти руками
                                    regexpResult = regExps.body3.exec(buffer);
                                }
                                if (!regexpResult) {
                                    console.log("Cannot parse BODY for message %s", prefix);
                                    console.log(buffer);
                                    return false;
                                }
                                senderEmail = regexpResult[1];
                                console.log("No user with email %s", senderEmail);
                                Meteor.call('adm_userAdd', {
                                    email: senderEmail,
                                    password: Meteor.call('passwordGenerate'),
                                    flatNumber: flatNumber
                                }, function (error, userId) {
                                    if (!userId) {
                                        console.log("-----!!!! ERR NO USER_ID!");
                                        Meteor._sleepForMs(5000);
                                    }
                                    countersValues = {
                                        userId: userId,
                                        month: month,
                                        year: year,
                                        coldwater1: parseFloat(regexpResult[2].replace(',', '.')) || 0,
                                        coldwater2: parseFloat(regexpResult[3].replace(',', '.')) || 0,
                                        hotwater1: parseFloat(regexpResult[4].replace(',', '.')) || 0,
                                        hotwater2: parseFloat(regexpResult[5].replace(',', '.')) || 0,
                                        electricity: parseFloat(regexpResult[6].replace(',', '.')) || null,
                                        electricity_direct: regExps.isElectricityDirect.test(regexpResult[7]),
                                        comment: regexpResult[7],
                                        createdAt: new Date(headers.date[0])
                                    };

                                    countersValues = {
                                        userId: userId,
                                        month: month,
                                        year: year,
                                        coldwater1: regexpResult[2],
                                        coldwater2: regexpResult[3],
                                        hotwater1: regexpResult[4],
                                        hotwater2: regexpResult[5],
                                        electricity: regexpResult[6],
                                        electricity_direct: regExps.isElectricityDirect.test(regexpResult[7]),
                                        comment: regexpResult[7],
                                        createdAt: new Date(headers.date[0])
                                    };

                                    var addCountersResult = Meteor.call('rowAdd', countersValues, function (error, result) {
                                        if (error) {
                                            console.log(countersValues);
                                        }
                                    });
                                    if (addCountersResult) {
                                        mailCounter++;
                                    }
                                });
                            }));
                        }));
                    }));
                    f.once('error', function (err) {
                        var result = -1;
                        console.log('Fetch error: ' + err);
                        done(err, result)
                    });
                    f.once('end', function () {
                        console.log('Done fetching all messages!');
                        Mail.imap.end();
                        done(null, mailCounter);
                    });

                }));
            }));
            Mail.imap.once('error', function (err) {
                console.log("Imap error happenned!");
                console.log(err);
                done(err, null);
            });
            Mail.imap.once('end', function () {
                console.log('Connection ended');
                done(null, 'Connection ended');
            });
            Mail.imap.connect();
        });
        return result;

    }
});


function notifyClient(params) {
    //console.log("$$$---Notifying client with:", params);
    //throw new Meteor.Error(params.type || 'info', params.title || '', {message: params.message || '', options:  params.options || {}});
}