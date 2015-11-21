SimpleSchema.debug = true;
Schemas = {
    Row: new SimpleSchema({
        userId: {
            type: String,
            optional: true,
            autoValue: function() {
                return this.userId;
            },
            autoform: {
                omit: true
            }
        },

        month: {
            type: Number,
            label: "Месяц",
            autoform: {
                options: [
                    {label:'Январь', value: 1},
                    {label:'Февраль', value: 2},
                    {label:'Март', value: 3},
                    {label:'Апрель', value: 4},
                    {label:'Май', value: 5},
                    {label:'Июнь', value: 6},
                    {label:'Июль', value: 7},
                    {label:'Август', value: 8},
                    {label:'Сентябрь', value: 9},
                    {label:'Октябрь', value: 10},
                    {label:'Ноябрь', value: 11},
                    {label:'Декабрь', value: 12}
                ],
                defaultValue: (new Date().getMonth()+1)
            }
        },
        year: {
            type: Number,
            label: "Год",
            min: 2014,
            max: 2099,
            autoform: {
                defaultValue: new Date().getFullYear().toString()
            }
        },
        coldwater1: {
            type: Number,
            label: "ХВС1"
        },
        coldwater2: {
            type: Number,
            label: "ХВС2"
        },
        hotwater1: {
            type: Number,
            label: "ГВС1"
        },
        hotwater2: {
            type: Number,
            label: "ГВС2"
        },
        electricity: {
            optional: true,
            type: Number,
            label: "Электричество"
            /*добавить кастомную валидацию с учетом поля electricity_direct*/
        },
        electricity_direct: {
            type: Boolean,
            label: "Прямой договор с МосЭнергоСбыт",
            autoform: {
                afCheckbox: {
                    template: 'mine'
                }
            }
        },

        comment: {
            type: String,
            label: "Комментарий",
            optional: true,
            max: 1000,
            autoform: {
                type: 'textarea',
                rows: 4
            }
        },

        createdAt: {
            type: Date,
            optional: true,
            autoValue: function() {
                if (this.isInsert) {
                    return new Date;
                } else if (this.isUpsert) {
                    return {$setOnInsert: new Date};
                } else {
                    this.unset();  // Prevent user from supplying their own value
                }
            },
            autoform: {
                omit: true
            }
        }
    })
};

SimpleSchema.messages({
    required: "[label] - обязательное поле"
});

Rows = new Mongo.Collection("rows");
Rows.attachSchema(Schemas.Row);
