TabularTables = {};
Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);
TabularTables.Rows = new Tabular.Table({
    name: "Rows",
    collection: Meteor.users,
    columns: [
        {
            data: "rows.month",
            title: "Период показаний",
            tmpl: Meteor.isClient && Template.rowItemPeriod

        },
        {data: "rows", title: "ХВС1"},
        {data: "rows.coldwater2", title: "ХВС2"},
        {data: "rows.hotwater1", title: "ГВС1"},
        {data: "rows.hotwater2", title: "ГВС2"},
        {data: "rows.heat", title: "Тепло"},
        {data: "rows.electricity", title: "Электричество"},
        {
            data: 'rows.electricity_direct',
            title: "Прямой договор",
            tmpl: Meteor.isClient && Template.rowItemCheckbox
        },
        {data: "rows.comment", title: "Комментарий"}
    ],
    searchable: false,
    language: {
        "processing": "Подождите...",
        "search": "Поиск:",
        "lengthMenu": "Показать _MENU_ записей",
        "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
        "infoEmpty": "Записи с 0 до 0 из 0 записей",
        "infoFiltered": "(отфильтровано из _MAX_ записей)",
        "infoPostFix": "",
        "loadingRecords": "Загрузка записей...",
        "zeroRecords": "Записи отсутствуют.",
        "emptyTable": "В таблице отсутствуют данные",
        "paginate": {
            "first": "Первая",
            "previous": "Предыдущая",
            "next": "Следующая",
            "last": "Последняя"
        },
        "aria": {
            "sortAscending": ": активировать для сортировки столбца по возрастанию",
            "sortDescending": ": активировать для сортировки столбца по убыванию"
        }
    }
});

TabularTables.Users = new Tabular.Table({
    name: "Users",
    collection: Meteor.users,
    columns: [
        {data: "emails[0].address", title: "E-mail", tmpl: Meteor.isClient && Template.adminUserlistUserViewLink},
        {data: "flatNumber", title: "№ квартиры"},
        {data: "roles", title: "Администратор", tmpl: Meteor.isClient && Template.adminUserlistCheckbox}
    ],
    extraFields: ['_id'],
    selector: function( userId ) {
        if(Roles.userIsInRole(userId,'admin')) {
            return {};
        }
        return { userId: userId }
    },
    language: {
        "processing": "Подождите...",
        "search": "Поиск:",
        "lengthMenu": "Показать _MENU_ записей",
        "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
        "infoEmpty": "Записи с 0 до 0 из 0 записей",
        "infoFiltered": "(отфильтровано из _MAX_ записей)",
        "infoPostFix": "",
        "loadingRecords": "Загрузка записей...",
        "zeroRecords": "Записи отсутствуют.",
        "emptyTable": "В таблице отсутствуют данные",
        "paginate": {
            "first": "Первая",
            "previous": "Предыдущая",
            "next": "Следующая",
            "last": "Последняя"
        },
        "aria": {
            "sortAscending": ": активировать для сортировки столбца по возрастанию",
            "sortDescending": ": активировать для сортировки столбца по убыванию"
        }
    }
});