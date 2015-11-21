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
        console.log(existingRow);
        if (!existingRow) {
            console.log("No such row");
            return Rows.insert(doc);
        }
        //показания найдены. Определим, может ли пользователь их редактировать.
        //Редактирование показаний доступно только в первые сутки после их добавления
        tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        thenDate = existingRow.createdAt;
        console.log("Dates check:", tomorrowDate, thenDate);
        if(+tomorrowDate > +thenDate) {
            console.log("Edit possible!");
        }
        else {
            console.log("Edit impossible");
        }


    },
    'rowGet': function (rowId) {
        return Rows.findOne({userId: Meteor.userId(), _id: rowId});
    },

    'checkExistingRow': function (doc) {
        check(doc, Schemas.Row);
        return Rows.findOne({month: doc.month, year: doc.year});
    },

    'rowsList': function (rowId) {
        return Rows.find({userId: Meteor.userId()});
    },

    'rowsListInsecure': function (rowId) {
        console.log("Insecure rows called");
        var res = Rows.find();
        console.log(res);
        return res;
    }
});