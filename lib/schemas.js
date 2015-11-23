Schemas = {
    Row: new SimpleSchema({
        userId: {
            type: String,
            autoform: {
                label: false,
                type: 'hidden',
                value: function () {
                    return Meteor.userId();
                }
            }
        },

        month: {
            type: Number,
            label: "Месяц",
            autoform: {
                options: CommonHelpers.monthsForSelect(),
                defaultValue: (new Date().getMonth()+1),
                firstOption: 'Выберите месяц'
            }
        },
        year: {
            type: Number,
            label: "Год",
            min: 2015,
            max: 2099,
            autoform: {
                defaultValue: new Date().getFullYear().toString()
            }
        },
        coldwater1: {
            type: Number,
            min:0,
            label: "ХВС1"
        },
        coldwater2: {
            type: Number,
            min:0,
            label: "ХВС2"
        },
        hotwater1: {
            type: Number,
            min:0,
            label: "ГВС1"
        },
        hotwater2: {
            type: Number,
            min:0,
            label: "ГВС2"
        },
        electricity: {
            optional: true,
            type: Number,
            label: "Электричество",
            /*добавить кастомную валидацию с учетом поля electricity_direct*/
            custom: function () {
                var isDirectChecked = this.field('electricity_direct').value;
                if(isDirectChecked || this.value) {
                    return true;
                }
                if(this.value < 0) {
                    return 'minNumber'
                }
                return 'no_electricity_set';
            }
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
            max: 500,
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
                    this.unset();
                }
            },
            autoform: {
                omit: true
            }
        }
    })
};


SimpleSchema.messages({
    required: "[label] - обязательное поле",
    minString: "[label] должно быть по крайней мере [min] символов",
    maxString: "[label] не может превышать [max] символов",
    minNumber: "[label] не может быть меньше [min]",
    maxNumber: "[label] не может быть больше [max]",
    minDate: "[label] должно быть после [min]",
    maxDate: "[label] не может быть больше [max]",
    badDate: "[label] - некорректная дата",
    minCount: "Вы должны выбрать по меньшей мере [minCount] значений",
    maxCount: "Вы должны выбрать не более [maxCount] значений",
    noDecimal: "[label] должно быть целым числом",
    notAllowed: "[value] - недопустимое значение",
    expectedString: "[label] должно быть строкой",
    expectedNumber: "[label] должно быть числом",
    expectedBoolean: "[label] - неверный формат",
    expectedArray: "[label] - должно быть массивом",
    expectedObject: "[label] - должно быть объектом",
    expectedConstructor: "[label] должно быть типом [type]",
    regEx: [
        {msg: "[label] failed regular expression validation"},
        {exp: SimpleSchema.RegEx.Email, msg: "[label] must be a valid e-mail address"},
        {exp: SimpleSchema.RegEx.WeakEmail, msg: "[label] must be a valid e-mail address"},
        {exp: SimpleSchema.RegEx.Domain, msg: "[label] must be a valid domain"},
        {exp: SimpleSchema.RegEx.WeakDomain, msg: "[label] must be a valid domain"},
        {exp: SimpleSchema.RegEx.IP, msg: "[label] must be a valid IPv4 or IPv6 address"},
        {exp: SimpleSchema.RegEx.IPv4, msg: "[label] must be a valid IPv4 address"},
        {exp: SimpleSchema.RegEx.IPv6, msg: "[label] must be a valid IPv6 address"},
        {exp: SimpleSchema.RegEx.Url, msg: "[label] must be a valid URL"},
        {exp: SimpleSchema.RegEx.Id, msg: "[label] must be a valid alphanumeric ID"}
    ],
    keyNotInSchema: "[key] недопустимо для используемой схемы данных",


    "no_electricity_set": 'Вы должны заполнить это поле, если у вас нет прямого договора с МосЭнергоСбытом'
});

Rows = new Mongo.Collection("rows");
Rows.attachSchema(Schemas.Row);

