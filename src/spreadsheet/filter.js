(function(f, define){
    define([ "../kendo.core", "../kendo.data" ], f);
})(function(){
(function(kendo) {
    /*jshint evil: true */
    var Filter = kendo.spreadsheet.Filter = kendo.Class.extend({
        prepare: function() {

        },
        matches: function() {
            throw new Error("The 'matches' method is not implemented.");
        },
        toJSON: function() {
            throw new Error("The 'toJSON' method is not implemented.");
        }
    });

    Filter.create = function(options) {
        var type = options.type;

        if (!type) {
            throw new Error("Filter type not specified.");
        }

        var constructor = kendo.spreadsheet[type.charAt(0).toUpperCase() + type.substring(1) + "Filter"];

        if (!constructor) {
            if (/(top|bottom)(Number|Percent)/.test(type)) {
                constructor = kendo.spreadsheet.TopFilter;
            } else {
                throw new Error("Filter type not recognized.");
            }
        }

        return new constructor(options);
    };

    kendo.spreadsheet.ValueFilter = Filter.extend({
        values: [],

        dates: [],

        blanks: false,

        init: function(options) {
            if (options.values !== undefined) {
                this.values = options.values;
            }

            if (options.blanks !== undefined) {
                this.blanks = options.blanks;
            }

            if (options.dates !== undefined) {
                this.dates = options.dates;
            }
        },

        matches: function(value) {
            if (value === null) {
                return this.blanks;
            }

            if (value instanceof Date) {
                return this.dates.some(function(date) {
                    return date.year === value.getFullYear() &&
                        (date.month === undefined || date.month === value.getMonth()) &&
                        (date.day === undefined || date.day === value.getDate()) &&
                        (date.hours === undefined || date.hours === value.getHours()) &&
                        (date.minutes === undefined || date.minutes === value.getMinutes()) &&
                        (date.seconds === undefined || date.seconds === value.getSeconds());
                });
            }

            return this.values.indexOf(value) >= 0;
        },
        toJSON: function() {
            return {
                type: "value",
                values: this.values.slice(0)
            };
        }
    });

    kendo.spreadsheet.CustomFilter = Filter.extend({
        logic: "and",
        init: function(options) {
            if (options.logic !== undefined) {
                this.logic = options.logic;
            }

            if (options.criteria === undefined) {
                throw new Error("Must specify criteria.");
            }

            this.criteria = options.criteria;

            var expression = kendo.data.Query.filterExpr({
                logic: this.logic,
                filters: this.criteria
            }).expression;

            this._matches = new Function("d", "return " + expression);
        },
        matches: function(value) {
            if (value === null) {
                return false;
            }

            return this._matches(value);
        },
        toJSON: function() {
            return {
                type: "custom",
                logic: this.logic,
                criteria: this.criteria
            };
        }
    });

    kendo.spreadsheet.TopFilter = Filter.extend({
        init: function(options) {
            this.type = options.type;
            this.value = options.value;
            this.values = [];
        },

        prepare: function(values) {
            if (this.type === "topNumber" || this.type == "topPercent") {
                values.sort(function(x, y) {
                    return y - x;
                });
            } else {
                values.sort(function(x, y) {
                    return x - y;
                });
            }

            var count = this.value;

            if (this.type === "topPercent" || this.type === "bottomPercent") {
                count = (values.length * count / 100) >> 0;
            }

            this.values = values.slice(0, count);
        },
        matches: function(value) {
            return this.values.indexOf(value) >= 0;
        },
        toJSON: function() {
            return {
                type: this.type,
                value: this.value
            };
        }
    });

})(kendo);
}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });
