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

    'passwordGenerate': function () {
        var generatePassword = Meteor.npmRequire('password-generator');
        var pass = generatePassword();
        console.log(pass);
        return pass;
    },

    'adm_checkUserByEmail': function (userEmail) {
        console.log("Checking user with email ", userEmail);
        console.log(this);
        if (!Roles.userIsInRole(this.userId, ['admin'])) {
            /*notifyClient({
                type: 'error',
                title: 'Ошибка доступа!',
                message: 'Для вызова этой процедуры необходимы права администратора'
            });*/
        }
        check(userEmail, String);
        return Meteor.users.findOne({ "emails.address" : userEmail });
    },

    'adm_userAdd': function (doc) {
        console.log("Creating user", doc);
        //добавление пользователей доступно только администратору
        check(doc, Schemas.addUser);
        if (!Roles.userIsInRole(this.userId, ['admin'])) {
            notifyClient({
                type: 'error',
                title: 'Ошибка доступа!',
                message: 'Для добавления пользователей нужны права администратора.'
            });
        }

        var result = Accounts.createUser({
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

    'adm_checkMailProgress': function() {

    },

    'adm_checkMail': function() {
        console.log("adm_checkMail started");
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

            Mail.imap.once('ready', Async.wrap(function() {
                Mail.imap.openBox('ПОКАЗАНИЯ СЧЕТЧИКОВ', true, function(err, box) {
                    if (err) throw err;

                    var f = Mail.imap.seq.fetch('1:' + '3', {
                        bodies: ''
                    });

                    f.on('message', function(msg, seqno) {
                        var prefix = '(#' + seqno + ') ';
                        console.log(prefix);
                        msg.on('body', function(stream, info) {
                            var buffer = '';
                            stream.on('data', function(chunk) {
                                buffer += chunk.toString('utf8');
                            });
                            stream.once('end', Async.wrap(function() {
                                    var headers = Mail.Imap.parseHeader(buffer),
                                        flatNumber, senderEmail, countersValues,
                                        month, year;
                                    console.log('-------------------------');
                                    //please DO NOT LOOK BELOW. These regexps will make ur eyes BLEED and FALL OUT!
                                    var regExps = {
                                        header: /^Показания счетчиков (\d{4})-(\d{2}) кв\. (\d+)$/,
                                        body: /<p>(.+?)<\/p>.+?<\/thead><tr><td>([\d,.]+?)<\/td><td>([\d,.]+?)<\/td><td>([\d,.]+?)<\/td><td>([\d,.]+?)<\/td><td>([\d,.]+?)<\/td><tr><table><p>(.*?)<\/p>/,
                                        isElectricityDirect: /([Дд]оговор|[Пп]рямой)/
                                    }, regexpResult;
                                    regexpResult = regExps.header.exec(headers.subject[0]);
                                    //не вышло распарсить сообщение, нужно написать об ошибке и перейти к следующему
                                    if(!regexpResult) {
                                        console.log("Cannot parse HEADER for message %s", prefix);
                                        return false;
                                    }
                                    year = Number(regexpResult[1]);
                                    month = Number(regexpResult[2]);
                                    flatNumber = Number(regexpResult[3]);
                                    console.log(year, month, flatNumber, buffer);
                                    regexpResult = regExps.body.exec(buffer);
                                    if(!regexpResult) {
                                        console.log("Cannot parse BODY for message %s", prefix);
                                        return false;
                                    }
                                    senderEmail = regexpResult[1];
                                    //нашли отправителя. Проверим, есть ли такой юзер у нас в базе.
                                    var senderUser = Meteor.call('adm_checkUserByEmail', senderEmail);
                                    //если юзера нет, создадим его
                                    if(!senderUser) {
                                        console.log("No user with email %s", senderEmail);
                                        senderUser = Meteor.call('adm_userAdd',{
                                            email: senderEmail,
                                            password: Meteor.call('passwordGenerate'),
                                            flatNumber: flatNumber
                                        });
                                        console.log("USer created", senderUser);
                                    }

                                    countersValues = {
                                        userId: senderUser.id,
                                        coldwater1: regexpResult[2],
                                        coldwater2: regexpResult[3],
                                        hotwater1: regexpResult[4],
                                        hotwater2: regexpResult[5],
                                        electricity: regexpResult[6],
                                        electricity_direct: regExps.isElectricityDirect.test(regexpResult[7]),
                                        comment: regexpResult[7]
                                    };


                                    mailCounter++;
                            }));
                        });
                        msg.once('end', function() {
                            console.log(prefix + 'Parsed');
                        });
                    });
                    f.once('error', function(err) {
                        var result = -1;
                        console.log('Fetch error: ' + err);
                        done(err,result)
                    });
                    f.once('end', function() {
                        console.log('Done fetching all messages!');
                        Mail.imap.end();
                        done(null,mailCounter);
                    });

                });
            }));
            Mail.imap.once('error', function(err) {
                console.log(err);
                done(err,null);
            });
            Mail.imap.once('end', function() {
                console.log('Connection ended');
                done(null,'Connection ended');
            });
            Mail.imap.connect();
        });
        console.log(result);
        return result;

    }
});


function notifyClient(params) {
    throw new Meteor.Error(params.type || 'info', params.title || '', {message: params.message || '', options:  params.options || {}});
}