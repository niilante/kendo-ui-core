(function() {

    var deepExtend = kendo.deepExtend,
        draw = kendo.drawing,
        geom = kendo.geometry,
        dataviz = kendo.dataviz,
        Box2D = dataviz.Box2D,
        Point2D = dataviz.Point2D,
        chartBox = new Box2D(0, 0, 800, 600),
        CategoryAxis,
        TOLERANCE = 2;

    CategoryAxis = dataviz.CategoryAxis.extend({
        options: {
            labels: {
                // Tests expect particular font size
                font: "16px Verdana, sans-serif"
            }
        }
    });

    (function() {
        var categoryAxis,
            lineBox,
            MAX_LABEL_HEIGHT = 17,
            MAJOR_TICK_HEIGHT = 4,
            LINE_Y = chartBox.y1,
            LINE_X = 29,
            MARGIN = PADDING = 5;

        function createCategoryAxis(options) {
            categoryAxis = new CategoryAxis(
                $.extend({
                    categories: ["Foo", "Bar"]
                }, options)
            );
            categoryAxis.reflow(chartBox);
            lineBox = categoryAxis.lineBox();
            categoryAxis.renderVisual();
        }

        function getBackground() {
             return categoryAxis._backgroundPath;
        }

        function getLine() {
            return categoryAxis._lineGroup.children[0];
        }

        function getTicks() {
            return categoryAxis._lineGroup.children.slice(1);
        }

        function getAxisTextBoxes() {
            return $.map(categoryAxis.labels, function(item) {
                return item.visual;
            });
        }

        function getAxisTexts() {
            return $.map(getAxisTextBoxes(), function(item) {
                return kendo.util.last(item.children);
            });
        }

        (function() {
            var categories;
            var range;

            function setupAxis(options) {
                createCategoryAxis($.extend({
                    categories: ["A", "B", "C", "D"]
                }, options));
                categories = categoryAxis.options.categories;
                range = categoryAxis.rangeIndices();
            }

            // ------------------------------------------------------------
            module("Category Axis / range");

            test("filters categories based on min value", function() {
                setupAxis({
                    min: 1
                });

                equal(categories.length, 3);
                equal(categories[0], "B");
                equal(categories[2], "D");
            });

            test("filters categories based on not round min value", function() {
                setupAxis({
                    min: 1.5
                });

                equal(categories.length, 3);
                equal(categories[0], "B");
                equal(categories[2], "D");
            });

            test("filters categories based on max value", function() {
                setupAxis({
                    max: 2
                });

                equal(categories.length, 2);
                equal(categories[0], "A");
                equal(categories[1], "B");
            });

            test("filters categories based on max value (justified)", function() {
                setupAxis({
                    max: 2,
                    justified: true
                });

                equal(categories.length, 3);
                equal(categories[0], "A");
                equal(categories[2], "C");
            });

            test("filters categories based on not round max value", function() {
                setupAxis({
                    max: 2.5
                });

                equal(categories.length, 3);
                equal(categories[0], "A");
                equal(categories[2], "C");
            });

            test("filters categories based on not round max value (justified)", function() {
                setupAxis({
                    max: 2.5,
                    justified: true
                });

                equal(categories.length, 3);
                equal(categories[0], "A");
                equal(categories[2], "C");
            });

            // ------------------------------------------------------------
            module("Category Axis / range / indices");

            test("returns user set min value remainder", function() {
                setupAxis({
                    min: 2
                });

                equal(range.min, 0);

                setupAxis({
                    min: 2.5
                });

                equal(range.min, 0.5);
            });

            test("returns zero for the minimum if no min value is set", function() {
                setupAxis({});

                equal(range.min, 0);
            });

            test("returns the categories length for the max value if no max value is set", function() {
                setupAxis({});

                equal(range.max, 4);
            });

            test("returns the categories length minus one for justified axis if no max value is set", function() {
                setupAxis({
                    justified: true
                });

                equal(range.max, 3);
            });

            test("returns user set max value", function() {
                setupAxis({
                    max: 3
                });

                equal(range.max, 3);

                setupAxis({
                    max: 3.5
                });

                equal(range.max, 3.5);
            });

            test("returns user set max value relative to the min value", function() {
                setupAxis({
                    min: 1,
                    max: 3
                });

                equal(range.max, 2);

                setupAxis({
                    min: 1,
                    max: 2.5
                });

                equal(range.max, 1.5);
            });

            test("returns user set max value (justified)", function() {
                setupAxis({
                    max: 3,
                    justified: true
                });

                equal(range.max, 3);

                setupAxis({
                    max: 2.5,
                    justified: true
                });

                equal(range.max, 2.5);
            });

            test("returns user set max value relative to the min value (justified)", function() {
                setupAxis({
                    min: 1,
                    max: 3,
                    justified: true
                });

                equal(range.max, 2);

                setupAxis({
                    min: 1,
                    max: 2.5,
                    justified: true
                });

                equal(range.max, 1.5);
            });

            test("returns automatic maximum if user set maximum exceeds the total range", function() {
                setupAxis({
                    max: 10
                });

                equal(range.max, 4);
            });

            test("returns automatic maximum if user set maximum exceeds the categories length (justified)", function() {
                setupAxis({
                    max: 10,
                    justified: true
                });

                equal(range.max, 3);
            });

            // ------------------------------------------------------------
            module("Category Axis / range / total");

            test("returns zero for the minimum", function() {
                setupAxis({});

                var totalRange = categoryAxis.totalRange();

                equal(totalRange.min, 0);
            });

            test("returns the categories length for the maximum", function() {
                setupAxis({});

                var totalRange = categoryAxis.totalRange();

                equal(totalRange.max, 4);
            });

            test("returns the categories length minus one for the maximum (justified)", function() {
                setupAxis({
                    justified: true
                });

                var totalRange = categoryAxis.totalRange();

                equal(totalRange.max, 3);
            });

            test("returns zero for the minimum if the axis has been filtered", function() {
                setupAxis({
                    min: 2
                });

                var totalRange = categoryAxis.totalRange();

                equal(totalRange.min, 0);
            });

            test("returns the source categories length if the axis has been filtered", function() {
                setupAxis({
                    min: 2,
                    max: 3
                });

                var totalRange = categoryAxis.totalRange();

                equal(totalRange.max, 4);
            });

            test("returns the source categories length minus one if the axis has been filtered (justified)", function() {
                setupAxis({
                    min: 1,
                    max: 2,
                    justified: true
                });

                var totalRange = categoryAxis.totalRange();

                equal(totalRange.max, 3);
            });

            test("returns the series maximum if bigger than the categories length", function() {
                setupAxis({
                    min: 2,
                    max: 3
                });

                categoryAxis._seriesMax = 5;

                var totalRange = categoryAxis.totalRange();

                equal(totalRange.max, 5);
            });

            test("returns the categories length if bigger than the series maximum", function() {
                setupAxis({
                    min: 2,
                    max: 3
                });

                categoryAxis._seriesMax = 3;

                var totalRange = categoryAxis.totalRange();

                equal(totalRange.max, 4);
            });

            // ------------------------------------------------------------
            module("Category Axis / range / total indices");

            test("returns zero for the minimum", function() {
                setupAxis({});

                var totalRange = categoryAxis.totalRangeIndices();

                equal(totalRange.min, 0);
            });

            test("returns user set min value", function() {
                setupAxis({
                    min: 2
                });

                var totalRange = categoryAxis.totalRangeIndices();

                equal(totalRange.min, 2);
            });

            test("returns the categories length for the maximum", function() {
                setupAxis({});

                var totalRange = categoryAxis.totalRangeIndices();

                equal(totalRange.max, 4);
            });

            test("returns the categories length minus one for the maximum (justified)", function() {
                setupAxis({
                    justified: true
                });

                var totalRange = categoryAxis.totalRangeIndices();

                equal(totalRange.max, 3);
            });

            test("returns user set maximum", function() {
                setupAxis({
                    max: 3
                });

                var totalRange = categoryAxis.totalRangeIndices();

                equal(totalRange.max, 3);
            });

            test("does not limit user set maximum", function() {
                setupAxis({
                    max: 20
                });

                var totalRange = categoryAxis.totalRangeIndices();

                equal(totalRange.max, 20);
            });

            test("limits user set maximum if true is passed as parameter", function() {
                setupAxis({
                    max: 20
                });

                var totalRange = categoryAxis.totalRangeIndices(true);

                equal(totalRange.max, 4);
            });

            test("returns user set minimum plus the categories length if only the minimum value is set", function() {
                setupAxis({
                    min: 3
                });

                var totalRange = categoryAxis.totalRangeIndices();

                equal(totalRange.max, 3 + categories.length);
            });

        })();

        (function() {
            var TOLERANCE = 0.01;
            var categories;
            var range;

            function setupAxis(options) {
                createCategoryAxis($.extend({
                    categories: ["A", "B", "C", "D"]
                }, options));
                categories = categoryAxis.options.categories;
            }

            // ------------------------------------------------------------
            module("Category Axis / pan");

            test("returns translated range",  function() {
                setupAxis({
                    min: 1,
                    max: 2
                });

                range = categoryAxis.pan(100);
                close(range.min, 1.125, TOLERANCE);
                close(range.max, 2.125, TOLERANCE);

                range = categoryAxis.pan(-100);
                close(range.min, 0.875, TOLERANCE);
                close(range.max, 1.875, TOLERANCE);
            });

            test("returns undefined if range exceeds maximum",  function() {
                setupAxis({
                    min: 1
                });

                range = categoryAxis.pan(100);
                ok(!range);
            });

            test("returns undefined if range exceeds minimum",  function() {
                setupAxis({
                    max: 1
                });

                range = categoryAxis.pan(-100);
                ok(!range);
            });

            // ------------------------------------------------------------
            module("Category Axis / zoom");

            test("returns scaled range",  function() {
                setupAxis({
                    min: 1,
                    max: 4
                });

                range = categoryAxis.zoomRange(1);
                equal(range.min, 2);
                equal(range.max, 3);

                setupAxis({
                    min: 1,
                    max: 2
                });

                range = categoryAxis.zoomRange(-1);
                equal(range.min, 0);
                equal(range.max, 3);
            });

            test("limits range to zero",  function() {
                setupAxis({
                    min: 0.5
                });

                range = categoryAxis.zoomRange(-1);
                equal(range.min, 0);
            });

            test("limits range to maximum",  function() {
                setupAxis({
                    min: 3.5
                });

                range = categoryAxis.zoomRange(-1);
                equal(range.max, 4);
            });

            test("returns undefined if new range is not bigger than zero",  function() {
                setupAxis({
                    min: 1,
                    max: 3
                });

                range = categoryAxis.zoomRange(1);
                ok(!range);
            });

            // ------------------------------------------------------------
            module("Category Axis / pointsRange");

            test("returns range based on passed points",  function() {
                setupAxis({});

                range = categoryAxis.pointsRange(new Point2D(200, 0), new Point2D(400, 0));
                close(range.min, 1, TOLERANCE);
                close(range.max, 2, TOLERANCE);
            });

            test("returns range based on passed points (reverse)",  function() {
                setupAxis({
                    reverse: true
                });

                range = categoryAxis.pointsRange(new Point2D(200, 0), new Point2D(400, 0));
                close(range.min, 2, TOLERANCE);
                close(range.max, 3, TOLERANCE);
            });

        })();

        // ------------------------------------------------------------
        module("Category Axis / Configuration / Labels");

        test("normalizes labels rotation options if object is passed", function() {
            createCategoryAxis({
                labels: {
                    rotation: {
                        angle: 30,
                        align: "center"
                    }
                }
            });

            equal(categoryAxis.labels[0].options.rotation, 30);
            equal(categoryAxis.labels[0].options.alignRotation, "center");
        });

        test("sets labels rotation to zero if auto is set as value", function() {
            createCategoryAxis({
                labels: {
                    rotation: {
                        angle: "auto"
                    }
                }
            });

            equal(categoryAxis.labels[0].options.rotation, 0);

            createCategoryAxis({
                labels: {
                    rotation: "auto"
                }
            });

            equal(categoryAxis.labels[0].options.rotation, 0);
        });

        test("sets autoRotateLabels option to true if auto is set as rotation value", function() {
            createCategoryAxis({
                labels: {
                    rotation: {
                        angle: "auto"
                    }
                }
            });

            equal(categoryAxis.options.autoRotateLabels, true);

            createCategoryAxis({
                labels: {
                    rotation: "auto"
                }
            });

            equal(categoryAxis.options.autoRotateLabels, true);
        });

        test("labels are not created if _deferLabels option is true", function() {
            categoryAxis = new CategoryAxis({
                labels: {
                    visible: true
                },
                categories: ["foo"],
                _deferLabels: true
            });
            ok(!categoryAxis.labels);
        });

        // ------------------------------------------------------------
        module("Category Axis / Horizontal / Rendering", {
            setup: function() {
                createCategoryAxis();
            }
        });

        test("creates axis line", function() {
            var expectedLine = draw.Path.fromPoints([[chartBox.x1, LINE_Y], [chartBox.x2, LINE_Y]]);
            dataviz.alignPathToPixel(expectedLine);
            sameLinePath(getLine(), expectedLine, TOLERANCE);
        });

        test("creates background box", function() {
            createCategoryAxis({ background: "red" });

            var rect = getBackground();
            var box = draw.Path.fromRect(categoryAxis.box.toRect());

            sameLinePath(rect, box, TOLERANCE);
        });

        test("should not create axis line if visible is false", function() {
            createCategoryAxis({ line: { visible: false } });

            ok(!categoryAxis._lineGroup);
        });

        test("should not render axis if visible is false", function() {
            createCategoryAxis({ visible: false });
            ok(!categoryAxis.visual);
        });

        test("creates labels", 1, function() {
            equalTexts(getAxisTexts(), ["Foo", "Bar"]);
        });

        test("creates labels with full format", 1, function() {
            createCategoryAxis({ categories: [1, 2], labels: { format: "{0:C}"} });
            equalTexts(getAxisTexts(), ["$1.00", "$2.00"]);
        });

        test("creates labels with simple format", 1, function() {
            createCategoryAxis({ categories: [1, 2], labels: { format: "C"} });
            equalTexts(getAxisTexts(), ["$1.00", "$2.00"]);
        });

        test("labels can be hidden", function() {
            createCategoryAxis({
                labels: {
                    visible: false
                }
            });

            equal(categoryAxis.labels.length, 0);
        });

        test("labels have set template", 1, function() {
            createCategoryAxis({
                labels: {
                    template: "|${ data.value }|"
                }
            });

            equal(getAxisTexts()[0].content(), "|Foo|");
        });

        test("labels have set color", 1, function() {
            createCategoryAxis({
                labels: {
                    color: "#f00"
                }
            });

            equal(getAxisTexts()[0].options.fill.color, "#f00");
        });

        test("labels have rotation angle", 1, function() {
            createCategoryAxis({
                labels: {
                    rotation: 42.5
                }
            });

            equal(categoryAxis.labels[0].options.rotation, 42.5);
        });

        test("labels have set background", 1, function() {
            createCategoryAxis({
                labels: {
                    background: "#f0f"
                }
            });

            equal(getAxisTextBoxes()[0].children[0].options.fill.color, "#f0f");
        });

        test("labels have set zIndex", 1, function() {
            createCategoryAxis({
                zIndex: 2
            });

            equal(getAxisTextBoxes()[0].options.zIndex, 2);
        });

        test("labels are positioned below axis line with margin and padding", 2, function() {
            createCategoryAxis({
                labels: {
                    margin: MARGIN,
                    padding: PADDING
                }
            });
            closeTextPosition("y", getAxisTexts(), LINE_Y + MAJOR_TICK_HEIGHT + 2 * MARGIN + PADDING, TOLERANCE);
        });

        test("labels are distributed horizontally", function() {
            closeTextPosition("x", getAxisTexts(), [187.5, 586.5], TOLERANCE);
        });

        test("labels are distributed horizontally (justified)", function() {
            createCategoryAxis({ justified: true });
            closeTextPosition("x", getAxisTexts(), [-12, 787], TOLERANCE);
        });

        test("labels are distributed horizontally in reverse", function() {
            createCategoryAxis({ reverse: true });

            closeTextPosition("x", getAxisTexts(), [586.5, 187.5], TOLERANCE);
        });

        test("labels are distributed horizontally in reverse (justified)", function() {
            createCategoryAxis({ justified: true, reverse: true });
            closeTextPosition("x", getAxisTexts(), [787, -12], TOLERANCE);
        });

        test("labels are positioned below axis line", 2, function() {
            closeTextPosition("y", getAxisTexts(), LINE_Y + MAJOR_TICK_HEIGHT + MARGIN, TOLERANCE);
        });

        test("major ticks are distributed horizontally", function() {
            arrayClose($.map(getTicks(), function(line) {return line.segments[0].anchor().x;}),
                 [0.5, 400.5, 800.5], TOLERANCE);
        });

        test("major ticks are distributed horizontally (justified)", function() {
            createCategoryAxis({ justified: true });
            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().x; }),
                 [0.5, 799.5], TOLERANCE);
        });

        test("major ticks are distributed horizontally in reverse", function() {
            createCategoryAxis({ reverse: true });
            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().x; }),
                 [800, 400, 0], TOLERANCE);
        });

        test("major ticks are distributed horizontally in reverse (justified)", function() {
            createCategoryAxis({ justified: true, reverse: true });
            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().x; }),
                 [799.5, 0.5], TOLERANCE);
        });

        test("major ticks can be disabled", function() {
            createCategoryAxis({ majorTicks: { visible: false }});
            equal(getTicks().length, 0);
        });

        test("minor ticks are distributed horizontally", function() {
            createCategoryAxis({
                majorTicks: { visible: false },
                minorTicks: { visible: true }
            });
            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().x; }),
                 [0, 200, 400, 600, 800], TOLERANCE);
        });

        test("minor ticks are distributed horizontally (justified)", function() {
            createCategoryAxis({
                justified: true,
                majorTicks: { visible: false },
                minorTicks: { visible: true }
            });
            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().x; }),
                 [0.5, 400.5, 799.5], TOLERANCE);
        });

        test("minor ticks are distributed horizontally in reverse", function() {
            createCategoryAxis({
                reverse: true,
                majorTicks: { visible: false },
                minorTicks: { visible: true }
             });
            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().x; }),
                 [800, 600, 400, 200, 0], TOLERANCE);
        });

        test("minor ticks are distributed horizontally in reverse (justified)", function() {
            createCategoryAxis({
                justified: true,
                reverse: true,
                majorTicks: { visible: false },
                minorTicks: { visible: true }
            });

            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().x; }),
                 [799.5, 400.5, 0.5], TOLERANCE);
        });

        test("minor ticks can be disabled", function() {
            createCategoryAxis({
                majorTicks: { visible: false },
            });
            equal(getTicks().length, 0);
        });

        test("line width 0 remove all ticks", function() {
            createCategoryAxis({
                line: {
                    width: 0
                }
            });
            ok(!categoryAxis._lineGroup);
        });

        test("major ticks are aligned to axis", 3, function() {
            $.each(getTicks(), function() {
                equal(this.segments[0].anchor().y, 0.5);
            });
        });

        test("minor ticks are aligned to axis", 5, function() {
            createCategoryAxis({
                majorTicks: { visible: false },
                minorTicks: { visible: true }
            });

            $.each(getTicks(), function() {
                equal(this.segments[0].anchor().y, 0.5);
            });
        });

        // ------------------------------------------------------------
        module("Category Axis / Horizontal / Label Step / Rendering", {
            setup: function() {
                createCategoryAxis({
                    categories: ["Foo", "Bar", "Baz"],
                    labels: { step: 2 }
                });
            }
        });

        test("renders every second label", function() {
            deepEqual($.map(getAxisTexts(), function(text) { return text.content() }),
                 ["Foo", "Baz"]);
        });

        test("labels are distributed horizontally", function() {
            arrayClose($.map(getAxisTexts(), function(text) { return text.rect().origin.x }),
                 [121.5, 652], TOLERANCE);
        });

        test("zero step doesn't hang", function() {
            createCategoryAxis({
                categories: ["Foo", "Bar", "Baz"],
                labels: { step: 0 }
            });

            ok(true);
        });

        // ------------------------------------------------------------
        module("Category Axis / Horizontal / Label Step and skip / Rendering", {
            setup: function() {
                createCategoryAxis({
                    categories: ["Foo", "Bar", "Baz"],
                    labels: { step: 2, skip: 2 }
                });
            }
        });

        test("renders every second label, starting from the third", function() {
            deepEqual($.map(getAxisTexts(), function(text) { return text.content() }),
                 ["Baz"]);
        });

        test("labels are distributed horizontally, starting from the third", function() {
            arrayClose($.map(getAxisTexts(), function(text) { return text.rect().origin.x }),
                 [652], TOLERANCE);
        });

        // ------------------------------------------------------------
        module("Category Axis / Horizontal / Mirrored / Rendering", {
            setup: function() {
                createCategoryAxis({ labels: { mirror: true } });
            }
        });

        test("labels are aligned bottom", 2, function() {
            $.each(getAxisTexts(), function() {
                equal(this.rect().origin.y, 0);
            })
        });

        test("major ticks are aligned to axis", 3, function() {
            $.each(getTicks(), function() {
                equal(this.segments[0].anchor().y, 20.5);
            });
        });

        test("minor ticks are aligned to axis", 5, function() {
            createCategoryAxis({
                labels: { mirror: true },
                majorTicks: { visible: false },
                minorTicks: { visible: true }
            });
            $.each(getTicks(), function() {
                equal(this.segments[0].anchor().y, 20.5);
            });
        });

        // ------------------------------------------------------------
        module("Category Axis / Vertical / Rendering", {
            setup: function() {
                createCategoryAxis({ vertical: true });
            }
        });

        test("creates axis line", function() {
            var expectedLine = draw.Path.fromPoints([[LINE_X + MARGIN, chartBox.y1], [LINE_X + MARGIN, chartBox.y2]]);
            dataviz.alignPathToPixel(expectedLine);
            sameLinePath(getLine(), expectedLine, TOLERANCE);
        });

        test("should not create axis line if visible is false", function() {
            createCategoryAxis({ line: { visible: false }, vertical: true });

            ok(!categoryAxis._lineGroup);
        });

        test("should not render axis if visible is false", function() {
            createCategoryAxis({ visible: false, vertical: true });

            ok(!categoryAxis.visual);
        });

        test("creates axis with dash type", function() {
            createCategoryAxis({
                line: {
                    dashType: "dot"
                }
            });

            equal(getLine().options.stroke.dashType, "dot");
        });

        test("creates labels", 1, function() {
            deepEqual($.map(getAxisTexts(), function(text) { return text.content() }),
                 ["Foo", "Bar"]);
        });

        test("labels have rotation angle", 1, function() {
            createCategoryAxis({
                labels: {
                    rotation: 42.5
                }
            });

            equal(categoryAxis.labels[0].options.rotation, 42.5);
        });

        test("labels are distributed vertically", function() {
            arrayClose($.map(getAxisTexts(), function(text) { return text.rect().origin.y }),
                 [141, 441], TOLERANCE);
        });

        test("labels are distributed vertically (justified)", function() {
            createCategoryAxis({ vertical: true, justified: true });

            arrayClose($.map(getAxisTexts(), function(text) { return text.rect().origin.y }),
                 [-7.5, 591.5], TOLERANCE);
        });

        test("labels are positioned to the left of the axis line", function() {
            deepEqual($.map(getAxisTexts(), function(text) { return text.rect().origin.x }),
                 [0, 0]);
        });

        test("major ticks are distributed vertically", function() {
            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().y; }),
                 [0, 300, 600], TOLERANCE);
        });

        test("major ticks are distributed vertically (justified)", function() {
            createCategoryAxis({ vertical: true, justified: true });

            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().y; }),
                 [0.5, 599.5], TOLERANCE);
        });

        test("minor ticks are distributed vertically", function() {
            createCategoryAxis({
                majorTicks: { visible: false },
                minorTicks: { visible: true },
                vertical: true
            });

            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().y; }),
                [0, 150, 300, 450, 600], TOLERANCE);
        });

        test("minor ticks are distributed vertically (justified)", function() {
            createCategoryAxis({
                majorTicks: { visible: false },
                minorTicks: { visible: true },
                vertical: true,
                justified: true
            });

            arrayClose($.map(getTicks(), function(line) { return line.segments[0].anchor().y; }),
                [0.5, 300.5, 599.5], TOLERANCE);
        });

        test("line width 0 remove all ticks", function() {
            createCategoryAxis({
                line: {
                    width: 0
                }
            });
            ok(!categoryAxis._lineGroup);
        });

        test("labels have set background", 1, function() {
            createCategoryAxis({
                vertical: true,
                labels: {
                    background: "#f0f"
                }
            });

            equal(getAxisTextBoxes()[0].children[0].options.fill.color, "#f0f");
        });

        test("labels are positioned to the left of the axis line with margin and padding", function() {
            createCategoryAxis({
                vertical: true,
                labels: {
                    margin: MARGIN,
                    padding: PADDING
                }
            });

            deepEqual($.map(getAxisTexts(), function(text) { return text.rect().origin.x }),
                 [0 + MARGIN + PADDING, 0 + MARGIN + PADDING]);
        });

        test("major ticks are aligned to axis", 3, function() {
            $.each(getTicks(), function() {
                equal(this.segments[0].anchor().x, 29.5);
            });
        });

        test("minor ticks are aligned to axis", 5, function() {
            createCategoryAxis({
                majorTicks: { visible: false },
                minorTicks: { visible: true },
                vertical: true
            });
            $.each(getTicks(), function() {
                equal(this.segments[0].anchor().x, 29.5);
            });
        });

        // ------------------------------------------------------------
        module("Category Axis / Vertical / Label Step / Rendering", {
            setup: function() {
                createCategoryAxis({
                    categories: ["Foo", "Bar", "Baz"],
                    labels: { step: 2 },
                    vertical: true
                });
            }
        });

        test("renders every second label", function() {
            deepEqual($.map(getAxisTexts(), function(text) { return text.content() }),
                 ["Foo", "Baz"]);
        });

        test("labels are distributed vertically", function() {
            arrayClose($.map(getAxisTexts(), function(text) { return text.rect().origin.y }),
                 [91, 491], TOLERANCE);
        });

        // ------------------------------------------------------------
        module("Category Axis / Vertical / Label Step and skip / Rendering", {
            setup: function() {
                createCategoryAxis({
                    categories: ["Foo", "Bar", "Baz"],
                    labels: { step: 2, skip: 2 },
                    vertical: true
                });
            }
        });

        test("renders every second label, starting from the third", function() {
            deepEqual($.map(getAxisTexts(), function(text) { return text.content() }),
                 ["Baz"]);
        });

        test("labels are distributed vertically, starting from the third", function() {
            arrayClose($.map(getAxisTexts(), function(text) { return text.rect().origin.y }),
                 [491], TOLERANCE);
        });

        // ------------------------------------------------------------
        module("Category Axis / Vertical / Mirrored / Rendering", {
            setup: function() {
                createCategoryAxis({ labels: { mirror: true }, vertical: true });
            }
        });

        test("labels are aligned left", function() {
            $.each(getAxisTexts(), function() { equal(this.rect().origin.x, 9); });
        });

        test("major ticks are aligned to axis", 3, function() {
            $.each(getTicks(), function() {
                    equal(this.segments[0].anchor().x, 0.5);
            });
        });

        test("minor ticks are aligned to axis", 5, function() {
            createCategoryAxis({
                majorTicks: { visible: false },
                minorTicks: { visible: true },
                labels: { mirror: true },
                vertical: true
            });

            $.each(getTicks(), function() {
                equal(this.segments[0].anchor().x, 0.5);
            });
        });

    })();

    (function() {
        var categoryAxis,
            lineBox;

        function createCategoryAxis(options) {
            categoryAxis = new CategoryAxis(
                $.extend({
                    categories: ["Foo", "Bar", "Baz"]
                }, options)
            );
            categoryAxis.reflow(chartBox);
            lineBox = categoryAxis.lineBox();
        }

        // ------------------------------------------------------------
        module("Category Axis / Horizontal / Slots", {
            setup: function() {
                createCategoryAxis();
            }
        });

        test("positions slot for first category", function() {
            var slot = categoryAxis.getSlot(0);
            arrayClose([slot.x1, slot.x2], [lineBox.x1, 266], TOLERANCE);
        });

        test("positions slot for first category (justified)", function() {
            createCategoryAxis({ justified: true });
            var slot = categoryAxis.getSlot(0);
            deepEqual([slot.x1, slot.x2], [lineBox.x1, lineBox.x1]);
        });

        test("positions slot for first category in reverse", function() {
            createCategoryAxis({ reverse: true });
            var slot = categoryAxis.getSlot(0);
            arrayClose([slot.x1, slot.x2], [533, lineBox.x2], TOLERANCE);
        });

        test("positions slot for first category in reverse (justified)", function() {
            createCategoryAxis({ reverse: true, justified: true });
            var slot = categoryAxis.getSlot(0);
            deepEqual([slot.x1, slot.x2], [lineBox.x2, lineBox.x2]);
        });

        test("positions slot for first w/o labels", function() {
            createCategoryAxis({ labels: { visible: false } });
            var slot = categoryAxis.getSlot(0);
            arrayClose([slot.x1, slot.x2], [lineBox.x1, 266], TOLERANCE);
        });

        test("positions slot for second category", function() {
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.x1, slot.x2], [266, 533], TOLERANCE);
        });

        test("positions slot for second category (justified)", function() {
            createCategoryAxis({ justified: true });
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.x1, slot.x2], [399, 399], TOLERANCE);
        });

        test("positions slot for second category in reverse", function() {
            createCategoryAxis({ reverse: true });
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.x1, slot.x2], [266, 533], TOLERANCE);
        });

        test("positions slot for second category in reverse (justified)", function() {
            createCategoryAxis({ reverse: true, justified: true });
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.x1, slot.x2], [399, 399], TOLERANCE);
        });

        test("positions slot for second category w/o labels", function() {
            createCategoryAxis({ labels: { visible: false } });
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.x1, slot.x2], [266, 533], TOLERANCE);
        });

        test("positions slot for third category", function() {
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.x1, slot.x2], [533, lineBox.x2], TOLERANCE);
        });

        test("positions slot for third category (justified)", function() {
            createCategoryAxis({ justified: true });
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.x1, slot.x2], [lineBox.x2, lineBox.x2], TOLERANCE);
        });

        test("positions slot for third category in reverse", function() {
            createCategoryAxis({ reverse: true });
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.x1, slot.x2], [lineBox.x1, 266], TOLERANCE);
        });

        test("positions slot for third category in reverse (justified)", function() {
            createCategoryAxis({ reverse: true, justified: true });
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.x1, slot.x2], [lineBox.x1, lineBox.x1], TOLERANCE);
        });

        test("positions slot for third category w/o labels", function() {
            createCategoryAxis({ labels: { visible: false } });
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.x1, slot.x2], [533, lineBox.x2], TOLERANCE);
        });

        test("slot height is 0", function() {
            var slot = categoryAxis.getSlot(0);
            deepEqual(slot.height(), 0);
        });

        test("assumes 1 category when no categories are defined", function() {
            categoryAxis = new CategoryAxis();
            categoryAxis.reflow(chartBox);

            var slot = categoryAxis.getSlot(0);
            deepEqual([slot.x1, slot.x2], [lineBox.x1, lineBox.x2]);
        });

        test("reports range minimum of 0", function() {
            equal(categoryAxis.range().min, 0);
        });

        test("reports range maximum equal to category count", function() {
            equal(categoryAxis.range().max, 3);
        });

        test("from value can't be lower than 0 if limited", function() {
            var slot = categoryAxis.getSlot(-1, -1, true);
            equal(slot.x1, 0);
        });

        test("caps from value to categories count if limited", function() {
            var slot = categoryAxis.getSlot(1000, 1000, true);
            equal(slot.x1, lineBox.x2);
        });

        test("to value equals from value when not set (justified)", function() {
            createCategoryAxis({ justified: true });
            var slot = categoryAxis.getSlot(2);
            equal(slot.x2, slot.x1);
        });

        test("to value equals from value when not set (justified)", function() {
            createCategoryAxis({ justified: true });
            var slot = categoryAxis.getSlot(2);
            equal(slot.x2, lineBox.x2);
        });

        test("value equals from value when smaller", function() {
            var slot = categoryAxis.getSlot(2, 1);
            equal(slot.x2, lineBox.x2);
        });

        test("positions last slot at line end (no categories)", function() {
            createCategoryAxis({ categories: []});
            var slot = categoryAxis.getSlot(Number.MAX_VALUE, Number.MAX_VALUE, true);
            arrayClose([slot.x1, slot.x2], [lineBox.x2, lineBox.x2], TOLERANCE);
        });

        test("slot method returns slot as rect", function() {
            var box = categoryAxis.getSlot(0);
            var slot = categoryAxis.slot(0);
            ok(slot.equals(box.toRect()));
        });

        // ------------------------------------------------------------
        module("Category Axis / Vertical / Slots", {
            setup: function() {
                createCategoryAxis({ vertical: true });
            }
        });

        test("positions slot for first category", function() {
            var slot = categoryAxis.getSlot(0);
            arrayClose([slot.y1, slot.y2], [lineBox.y1, 200], TOLERANCE);
        });

        test("positions slot for first category (justified)", function() {
            createCategoryAxis({ vertical: true, justified: true });
            var slot = categoryAxis.getSlot(0);
            deepEqual([slot.y1, slot.y2], [lineBox.y1, lineBox.y1]);
        });

        test("positions slot for first category in reverse", function() {
            createCategoryAxis({ vertical: true, reverse: true });
            var slot = categoryAxis.getSlot(0);
            arrayClose([slot.y1, slot.y2], [399, lineBox.y2], TOLERANCE);
        });

        test("positions slot for first category in reverse (justified)", function() {
            createCategoryAxis({ vertical: true, reverse: true, justified: true });
            var slot = categoryAxis.getSlot(0);
            deepEqual([slot.y1, slot.y2], [lineBox.y2, lineBox.y2]);
        });

        test("positions slot for first w/o labels", function() {
            createCategoryAxis({ vertical: true, labels: { visible: false } });
            var slot = categoryAxis.getSlot(0);
            arrayClose([slot.y1, slot.y2], [lineBox.y1, 200], TOLERANCE);
        });

        test("positions slot for second category", function() {
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.y1, slot.y2], [200, 399], TOLERANCE);
        });

        test("positions slot for second category (justified)", function() {
            createCategoryAxis({ vertical: true, justified: true });
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.y1, slot.y2], [300, 300], TOLERANCE);
        });

        test("positions slot for second category in reverse", function() {
            createCategoryAxis({ vertical: true, reverse: true });
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.y1, slot.y2], [200, 399], TOLERANCE);
        });

        test("positions slot for second category in reverse (justified)", function() {
            createCategoryAxis({ vertical: true, reverse: true, justified: true });
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.y1, slot.y2], [300, 300], TOLERANCE);
        });

        test("positions slot for second category w/o labels", function() {
            createCategoryAxis({ vertical: true, labels: { visible: false } });
            var slot = categoryAxis.getSlot(1);
            arrayClose([slot.y1, slot.y2], [200, 399], TOLERANCE);
        });

        test("positions slot for third category", function() {
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.y1, slot.y2], [399, lineBox.y2], TOLERANCE);
        });

        test("positions slot for third category (justified)", function() {
            createCategoryAxis({ vertical: true, justified: true });
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.y1, slot.y2], [lineBox.y2, lineBox.y2], TOLERANCE);
        });

        test("positions slot for third category in reverse", function() {
            createCategoryAxis({ vertical: true, reverse: true });
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.y1, slot.y2], [lineBox.y1, 200], TOLERANCE);
        });

        test("positions slot for third category in reverse (justified)", function() {
            createCategoryAxis({ vertical: true, reverse: true, justified: true });
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.y1, slot.y2], [lineBox.y1, lineBox.y1], TOLERANCE);
        });

        test("positions slot for third category w/o labels", function() {
            createCategoryAxis({ vertical: true, labels: { visible: false } });
            var slot = categoryAxis.getSlot(2);
            arrayClose([slot.y1, slot.y2], [399, lineBox.y2], TOLERANCE);
        });

        test("slot width is 0", function() {
            var slot = categoryAxis.getSlot(0);
            deepEqual(slot.width(), 0);
        });

        test("positions last slot at line end (no categories)", function() {
            createCategoryAxis({ vertical: true, categories: []});
            var slot = categoryAxis.getSlot(Number.MAX_VALUE, Number.MAX_VALUE, true);
            arrayClose([slot.y1, slot.y2], [lineBox.y2, lineBox.y2], TOLERANCE);
        });

        test("slot method returns slot as rect", function() {
            var box = categoryAxis.getSlot(0);
            var slot = categoryAxis.slot(0);
            ok(slot.equals(box.toRect()));
        });

    })();

    (function() {
        var Point2D = kendo.dataviz.Point2D;
        var categoryAxis;

        // ------------------------------------------------------------
        module("CategoryAxis / getCategory / Horizontal ", {
            setup: function() {
                categoryAxis = new CategoryAxis({
                    categories: ["Foo", "Bar", "Baz"],
                    vertical: false,
                    labels: { visible: false }
                });

                categoryAxis.reflow(chartBox);
            }
        });

        test("returns null for coordinates left of axis", function() {
            deepEqual(categoryAxis.getCategory(new Point2D(-1, 0)), null);
        });

        test("returns null for coordinates right of axis", function() {
            deepEqual(categoryAxis.getCategory(new Point2D(1000, 0)), null);
        });

        test("returns first category for leftmost point", function() {
            equal(categoryAxis.getCategory(new Point2D(1, 0)), "Foo");
        });

        test("returns last category for righttmost point", function() {
            equal(categoryAxis.getCategory(new Point2D(799, 0)), "Baz");
        });

        test("returns category for middle point", function() {
            equal(categoryAxis.getCategory(new Point2D(334, 0)), "Bar");
        });

        test("returns single category for leftmost point", function() {
            categoryAxis = new CategoryAxis({
                categories: ["Foo"],
                vertical: false,
                labels: { visible: false }
            });

            categoryAxis.reflow(chartBox);
            equal(categoryAxis.getCategory(new Point2D(1, 0)), "Foo");
        });

        test("returns single category for righttmost point", function() {
            categoryAxis = new CategoryAxis({
                categories: ["Foo"],
                vertical: false,
                labels: { visible: false }
            });

            categoryAxis.reflow(chartBox);
            equal(categoryAxis.getCategory(new Point2D(799, 0)), "Foo");
        });

        // ------------------------------------------------------------
        module("CategoryAxis / getCategory / Horizontal / Reverse", {
            setup: function() {
                categoryAxis = new CategoryAxis({
                    categories: ["Foo", "Bar", "Baz"],
                    vertical: false,
                    reverse: true,
                    labels: { visible: false }
                });

                categoryAxis.reflow(chartBox);
            }
        });

        test("returns first category for righttmost point", function() {
            equal(categoryAxis.getCategory(new Point2D(799, 0)), "Foo");
        });

        test("returns last category for leftmost point", function() {
            equal(categoryAxis.getCategory(new Point2D(0, 0)), "Baz");
        });

        test("returns category for middle point", function() {
            equal(categoryAxis.getCategory(new Point2D(464, 0)), "Bar");
        });

        // ------------------------------------------------------------
        module("CategoryAxis / getCategory / Vertical ", {
            setup: function() {
                categoryAxis = new CategoryAxis({
                    categories: ["Foo", "Bar", "Baz"],
                    vertical: true,
                    labels: { visible: false }
                });

                categoryAxis.reflow(chartBox);
            }
        });

        test("returns null for coordinates above the axis", function() {
            deepEqual(categoryAxis.getCategory(new Point2D(0, -1)), null);
        });

        test("returns null for coordinates below the axis", function() {
            deepEqual(categoryAxis.getCategory(new Point2D(0, 1000)), null);
        });

        test("returns first category for bottommost point", function() {
            equal(categoryAxis.getCategory(new Point2D(0, 599)), "Baz");
        });

        test("returns last category for topmost point", function() {
            equal(categoryAxis.getCategory(new Point2D(0, 0)), "Foo");
        });

        test("returns category for middle point", function() {
            equal(categoryAxis.getCategory(new Point2D(0, 350)), "Bar");
        });

        test("returns single category for topmost point", function() {
            categoryAxis = new CategoryAxis({
                categories: ["Foo"],
                vertical: true,
                labels: { visible: false }
            });

            categoryAxis.reflow(chartBox);
            equal(categoryAxis.getCategory(new Point2D(0, 0)), "Foo");
        });

        test("returns single category for bottommost point", function() {
            categoryAxis = new CategoryAxis({
                categories: ["Foo"],
                vertical: true,
                labels: { visible: false }
            });

            categoryAxis.reflow(chartBox);
            equal(categoryAxis.getCategory(new Point2D(0, 350)), "Foo");
        });

        // ------------------------------------------------------------
        module("CategoryAxis / getCategory / Vertical / Reverse", {
            setup: function() {
                categoryAxis = new CategoryAxis({
                    categories: ["Foo", "Bar", "Baz"],
                    vertical: true,
                    reverse: true,
                    labels: { visible: false }
                });

                categoryAxis.reflow(chartBox);
            }
        });

        test("returns first category for topmost point", function() {
            equal(categoryAxis.getCategory(new Point2D(0, 0)), "Baz");
        });

        test("returns last category for bottommost point", function() {
            equal(categoryAxis.getCategory(new Point2D(0, 599)), "Foo");
        });

        test("returns category for middle point", function() {
            equal(categoryAxis.getCategory(new Point2D(0, 250)), "Bar");
        });

    })();

    (function() {
        var plotArea,
            plotBands,
            lineSeriesData = [{
                name: "Value A",
                type: "line",
                data: [100, 200, 300]
            }],
            barSeriesData =  [{
                name: "Value A",
                type: "bar",
                data: [100, 20, 30]
            }];

        function getPlotBands() {
            return plotArea.axes[0]._plotbandGroup;
        }

        function createPlotArea(series, chartOptions) {
            plotArea = new dataviz.CategoricalPlotArea(series, deepExtend({
                categoryAxis: {
                    categories: ["A"],
                    plotBands: [{
                        from: 0,
                        to: 1,
                        color: "red",
                        opacity: 0.5
                    }],
                    labels: {
                        // Tests expect particular font size
                        font: "16px Verdana, sans-serif"
                    }
                },
                valueAxis: {
                    labels: {
                        // Tests expect particular font size
                        font: "16px Verdana, sans-serif"
                    }
                }
            }, chartOptions));

            plotArea.reflow(chartBox);
            plotArea.renderVisual();
            plotBands = getPlotBands().children[0];
        }

        // ------------------------------------------------------------
        module("Category Axis / Plot Bands / Horizontal", {
            setup: function() {
                createPlotArea(lineSeriesData);
            }
        });

        test("renders box", function() {
            sameRectPath(plotBands, [33, 9, 288.333, 576], TOLERANCE);
        });

        test("renders color", function() {
            equal(plotBands.options.fill.color, "red");
        });

        test("renders opacity", function() {
            equal(plotBands.options.fill.opacity, 0.5);
        });

        test("renders z index", function() {
            equal(getPlotBands().options.zIndex, -1);
        });

        // ------------------------------------------------------------
        module("Category Axis / Plot Bands / Horizontal / Justified", {
            setup: function() {
                createPlotArea(lineSeriesData, { categoryAxis: { justified: true } });
            }
        });

        test("renders box", function() {
            sameRectPath(plotBands, [33, 9, 416, 576], TOLERANCE);
        });

        // ------------------------------------------------------------
        module("Category Axis / Plot Bands / Vertical", {
            setup: function() {
                createPlotArea(barSeriesData);
            }
        });

        test("renders box", function() {
            sameRectPath(plotBands, [17, 0, 788, 191], TOLERANCE);
        });

        test("renders color", function() {
            equal(plotBands.options.fill.color, "red");
        });

        test("renders opacity", function() {
            equal(plotBands.options.fill.opacity, 0.5);
        });

        test("renders z index", function() {
            equal(getPlotBands().options.zIndex, -1);
        });

        // ------------------------------------------------------------
        module("Category Axis / Plot Bands / Vertical / Justified", {
            setup: function() {
                createPlotArea([{
                    name: "Value A",
                    type: "verticalLine",
                    data: [100, 200, 300]
                }], { categoryAxis: { justified: true } });
            }
        });

        test("renders box", function() {
            sameRectPath(plotBands, [17, 7.5, 788, 291.75], TOLERANCE);
        });

        // ------------------------------------------------------------
        module("Category Axis / Plot Bands / Multiple Panes", {
            setup: function() {
                createPlotArea(lineSeriesData, {
                    categoryAxis: [{
                        pane: "top",
                        categories: ["A", "B", "C"],
                        plotBands: [{
                            from: 0,
                            to: 1
                        }]
                    }, {
                        pane: "bottom",
                        categories: ["A", "B", "C"],
                        plotBands: [{
                            from: 0,
                            to: 1
                        }]
                    }],
                    valueAxis: [{
                        pane: "top"
                    }, {
                        pane: "bottom"
                    }],
                    panes: [{
                        name: "top"
                    }, {
                        name: "bottom"
                    }]
                });
            }
        });

        test("renders plot band in top pane", function() {
            var topBand = plotArea.axes[0]._plotbandGroup.children[0];
            sameRectPath(topBand, [33, 9, 288, 276], TOLERANCE);
        });

        test("renders plot band in bottom pane", function() {
            var bottomBand = plotArea.axes[1]._plotbandGroup.children[0];
            sameRectPath(bottomBand, [33, 307, 288, 576], TOLERANCE);
        });

    })();


    (function() {
        var plotArea,
            textVisual,
            textboxVisual,
            textBackgroundVisual,
            titleBox,
            lineSeriesData = [{
                name: "Value A",
                type: "line",
                data: [100]
            }],
            barSeriesData =  [{
                name: "Value A",
                type: "bar",
                data: [100]
            }];

        function createPlotArea(series, plotOptions) {
            plotArea = new dataviz.CategoricalPlotArea(series, $.extend(true, {
                categoryAxis: {
                    categories: ["A"],
                    title: {
                        text: "text",
                        color: "red",
                        opacity: 0.33,
                        font: "16px Verdana, sans-serif",
                        position: "center",
                        background: "green"
                    },
                    labels: {
                        // Tests expect particular font size
                        font: "16px Verdana, sans-serif"
                    }
                },
                valueAxis: {
                    labels: {
                        // Tests expect particular font size
                        font: "16px Verdana, sans-serif"
                    }
                }
            }, plotOptions));

            plotArea.reflow(chartBox);
            plotArea.renderVisual();

            if (plotArea.axes[0].title) {
                textboxVisual = plotArea.axes[0].title.visual;
                textBackgroundVisual = textboxVisual.children[0];
                textVisual = textboxVisual.children[1];
            }
        }

        // ------------------------------------------------------------
        module("Category Axis / Title / Horizontal", {
            setup: function() {
                createPlotArea(lineSeriesData);
                titleBox = plotArea.axisX.title.box;
            }
        });

        test("positioned at center", function() {
            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 400.5, 585, 432.5, 600 ], TOLERANCE);
        });

        test("positioned left", function() {
            createPlotArea(lineSeriesData, { categoryAxis: { title: { position: "left" }}});
            titleBox = plotArea.axisX.title.box;

            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 34, 585, 65, 600 ], TOLERANCE);
        });

        test("positioned right", function() {
            createPlotArea(lineSeriesData, { categoryAxis: { title: { position: "right" }}});
            titleBox = plotArea.axisX.title.box;

            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 767, 585, 800, 600 ], TOLERANCE);
        });

        test("renders color", function() {
            equal(textVisual.options.fill.color, "red");
        });

        test("renders opacity", function() {
            equal(textBackgroundVisual.options.fill.opacity, 0.33);
        });

        test("renders zIndex", function() {
            equal(textboxVisual.options.zIndex, 1);
        });

        test("hidden when visible is false", function() {
            createPlotArea(lineSeriesData, { categoryAxis: { title: { visible: false }}});
            equal(plotArea.axisX.title, null);
        });

        // ------------------------------------------------------------
        module("Category Axis / Horizontal / Mirrored / Title", {
            setup: function() {
                createPlotArea(lineSeriesData, { categoryAxis: { labels: { mirror: true } }});
                titleBox = plotArea.axisX.title.box;
            }
        });

        test("positioned at center", function() {
            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 400.5, 553.5, 432.5, 568.5 ], TOLERANCE);
        });

        test("positioned left", function() {
            createPlotArea(lineSeriesData, {
                categoryAxis: { labels: { mirror: true }, title: { position: "left" }}
            });

            titleBox = plotArea.axisX.title.box;

            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 33, 553.5, 65, 568.5 ], TOLERANCE);
        });

        test("positioned right", function() {
            createPlotArea(lineSeriesData, {
                categoryAxis: { labels: { mirror: true }, title: { position: "right" }}
            });

            titleBox = plotArea.axisX.title.box;

            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 767, 553.5, 800, 568.5 ], TOLERANCE);
        });

        // ------------------------------------------------------------
        module("Category Axis / Title / Vertical", {
            setup: function() {
                createPlotArea(barSeriesData);
                titleBox = plotArea.axisY.title.box;
            }
        });

        test("applied position center", function() {
            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 0, 272.5, 15, 303 ], TOLERANCE);
        });

        test("applied position bottom", function() {
            createPlotArea(barSeriesData, { categoryAxis: { title: { position: "bottom" }}});
            titleBox = plotArea.axisY.title.box;

            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 0, 545, 15, 577 ], TOLERANCE);
        });

        test("applied position top", function() {
            createPlotArea(barSeriesData, { categoryAxis: { title: { position: "top" }}});
            titleBox = plotArea.axisY.title.box;

            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 0, 0, 15, 33 ], TOLERANCE);
        });

        test("renders color", function() {
            equal(textVisual.options.fill.color, "red");
        });

        test("renders opacity", function() {
            equal(textBackgroundVisual.options.fill.opacity, 0.33);
        });

        test("renders zIndex", function() {
            equal(textboxVisual.options.zIndex, 1);
        });

        // ------------------------------------------------------------
        module("Category Axis / Vertical / Mirrored / Title", {
            setup: function() {
                createPlotArea(barSeriesData, { categoryAxis: { labels: { mirror: true } }});
                titleBox = plotArea.axisY.title.box;
            }
        });

        test("applied position center", function() {
            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 21, 272.5, 36, 303 ], TOLERANCE);
        });

        test("applied position bottom", function() {
            createPlotArea(barSeriesData, {
                categoryAxis: { labels: { mirror: true }, title: { position: "bottom" }}
            });

            titleBox = plotArea.axisY.title.box;

            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 21, 545, 36, 577 ], TOLERANCE);
        });

        test("applied position top", function() {
            createPlotArea(barSeriesData, {
                categoryAxis: { labels: { mirror: true }, title: { position: "top" }}
            });

            titleBox = plotArea.axisY.title.box;

            arrayClose([titleBox.x1, titleBox.y1, titleBox.x2, titleBox.y2],
                 [ 21, 0, 36, 33 ], TOLERANCE);
        });

    })();

    (function() {
        var chart,
            label,
            plotArea;

        function axisLabelClick(clickHandler, options) {
            chart = createChart($.extend(true, {
                dataSource: [{
                    value: 1,
                    category: "A"
                }, {
                    value: 2,
                    category: "B"
                }, {
                    value: 3,
                    category: "C"
                }],
                series: [{
                    type: "line",
                    field: "value"
                }],
                categoryAxis: {
                    name: "Axis A",
                    field: "category"
                },
                axisLabelClick: clickHandler
            }, options));

            plotArea = chart._model.children[1];
            label = plotArea.categoryAxis.labels[1];

            chart._userEvents.press(0, 0, getChartDomElement(label));
            chart._userEvents.end(0, 0);
        }

        // ------------------------------------------------------------
        module("Category Axis / Events / axisLabelClick", {
            teardown: function() {
                destroyChart();
            }
        });

        test("fires when clicking axis labels", 1, function() {
            axisLabelClick(function() { ok(true); });
        });

        test("fires when clicking axis labels with children", 2, function() {
            axisLabelClick(function(e) {
                ok(true);
            }, {
                categoryAxis: {
                    labels: {
                        template: "<tspan>Foo</tspan>"
                    }
                }
            });

            chart._userEvents.press(0, 0, getChartDomElement(label).children().first());
            chart._userEvents.end(0, 0);
        });

        test("event arguments contain axis options", 1, function() {
            axisLabelClick(function(e) {
                equal(e.axis.type, "category");
            });
        });

        test("event arguments contain DOM element", 1, function() {
            axisLabelClick(function(e) {
                equal(e.element.length, 1);
            });
        });

        test("event arguments contain category index", 1, function() {
            axisLabelClick(function(e) {
                equal(e.index, 1);
            });
        });

        test("category index is correct when step is defined", 1, function() {
            axisLabelClick(function(e) {
                equal(e.index, 2);
            }, {
                categoryAxis: {
                    labels: {
                        step: 2
                    }
                }
            });
        });

        test("event arguments contain category name as text", 1, function() {
            axisLabelClick(function(e) {
                equal(e.text, "B");
            });
        });

        test("event arguments contain category name as value", 1, function() {
            axisLabelClick(function(e) {
                equal(e.value, "B");
            });
        });

        test("event arguments contain category data item", 1, function() {
            axisLabelClick(function(e) {
                equal(e.dataItem.value, 2);
            });
        });

    })();

    (function() {
        var chart,
            label,
            plotArea;

        function createBoundChart(options) {
            chart = createChart($.extend(true, {
                dataSource: [{
                    value: 1,
                    category: "A"
                }, {
                    value: 2,
                    category: "B"
                }, {
                    value: 3,
                    category: "C"
                }],
                series: [{
                    type: "line",
                    field: "value"
                }],
                categoryAxis: {
                    name: "Axis A",
                    field: "category"
                }
            }, options));

            plotArea = chart._model.children[1];
            label = plotArea.categoryAxis.labels[1];
        }

        // ------------------------------------------------------------
        module("Category Axis / Data Binding", {
            teardown: function() {
                destroyChart();
            }
        });

        test("categories are data bound", function() {
            createBoundChart();
            equal(plotArea.categoryAxis.labels.length, 3);
        });

        test("template has access to value", function() {
            createBoundChart({
                categoryAxis: {
                    labels: {
                        template: "#= ok(typeof value == 'string') #"
                    }
                }
            });
        });

        test("template has access to data item", function() {
            createBoundChart({
                categoryAxis: {
                    labels: {
                        template: "#= ok(typeof dataItem.value == 'number') #"
                    }
                }
            });
        });

        test("template has access to default format", function() {
            createBoundChart({
                categoryAxis: {
                    labels: {
                        format: 'foo',
                        template: "#= equal(format, 'foo') #"
                    }
                }
            });
        });

        test("template has access to default culture", function() {
            createBoundChart({
                categoryAxis: {
                    labels: {
                        culture: 'foo',
                        template: "#= equal(culture, 'foo') #"
                    }
                }
            });
        });

        test("categories are bound for secondary axis", function() {
            createBoundChart({
                categoryAxis: [{
                    name: "Axis A",
                    field: "category"
                }, {
                    name: "Axis B",
                    field: "category"
                }]
            });

            equal(plotArea.namedCategoryAxes["Axis B"].labels.length, 3);
        });

        test("categories are bound when using categoryAxes alias", function() {
            createBoundChart({
                categoryAxes: [{
                    name: "Axis A",
                    field: "category"
                }, {
                    name: "Axis B",
                    field: "category"
                }]
            });

            equal(plotArea.namedCategoryAxes["Axis A"].labels.length, 3);
            equal(plotArea.namedCategoryAxes["Axis B"].labels.length, 3);
        });

        test("visual has access to value", function() {
            createBoundChart({
                categoryAxis: {
                    labels: {
                        visual: function(e) {
                            ok(typeof e.value == 'string');
                        }
                    }
                }
            });
        });

        test("visual has access to data item", function() {
            createBoundChart({
                categoryAxis: {
                    labels: {
                        visual: function(e) {
                            ok(typeof e.dataItem.value == 'number');
                        }
                    }
                }
            });
        });

        test("template has access to default format", function() {
            createBoundChart({
                categoryAxis: {
                    labels: {
                        format: 'foo',
                        visual: function(e) {
                            equal(e.format, 'foo');
                        }
                    }
                }
            });
        });

        test("template has access to default culture", function() {
            createBoundChart({
                categoryAxis: {
                    labels: {
                        culture: 'foo',
                        visual: function(e) {
                            equal(e.culture, 'foo');
                        }
                    }
                }
            });
        });

    })();

    (function() {
        var categoryAxis,
            plot;

        function createCategoryAxis(options) {
            categoryAxis = new CategoryAxis(
                $.extend({
                    categories: ["Foo", "Bar", "Baz"]
                }, options)
            );
            categoryAxis.reflow(chartBox);
        }

        // ------------------------------------------------------------
        module("Category Axis / Notes");

        test("render if is in the range of the axis", function() {
            createCategoryAxis({
                notes: {
                    data: [{
                        value: 1
                    },{
                        value: 4
                    }]
                }
            });

            ok(categoryAxis.notes[0].options.visible);
            ok(!categoryAxis.notes[1].options.visible);
        });

        test("have text", function() {
            createCategoryAxis({
                notes: {
                    data: [{
                        value: 1,
                        label: {
                            text: "Foo"
                        }
                    }]
                }
            });

            equal(categoryAxis.notes[0].text, "Foo");
        });

        test("positions line on pixel", function() {
            createCategoryAxis({
                notes: {
                    data: [{
                        value: 1,
                        icon: {
                            visible: false
                        }
                    }]
                }
            });

            var note = categoryAxis.notes[0];
            note.createVisual();
            equal(note.visual.bbox().origin.x % 1, 0.5);
        });
    })();

    (function() {
        var ACTUAL_TICK_SIZE = 5;
        var MARGIN = 5;
        var axisBox;
        var axis;

        function LabelMock(box) {
            this.box = box;
            this.options = {};
            this.reflow = function(box) {
                this.box = box;
            };
        }

        // ------------------------------------------------------------
        module("Category Axis / Horizontal / reflow", {
            setup: function() {
                axis = new CategoryAxis({
                    categories: ["foo", "bar"],
                    vertical: false,
                    margin: MARGIN
                });
                axis.parent = {
                    box: new Box2D(0, 0, 100, 100),
                    getRoot: function() {
                        return this;
                    }
                };
                axisBox = new Box2D(0, 0, 50, 50);
                axis.labels = [new LabelMock(Box2D(0, 0, 20, 20)), new LabelMock(Box2D(0, 0, 20, 30))];
                axis.getActualTickSize = function() {
                    return ACTUAL_TICK_SIZE;
                };
            }
        });

        test("box height is equal to the maximum label height plus the tick size plus the margin ", function() {
            axis.reflow(axisBox);
            equal(axis.box.height(), 30 + ACTUAL_TICK_SIZE + MARGIN);
        });

        test("box height includes title height if title is set", function() {
            axis.title = new LabelMock(Box2D(0, 0, 20, 40));
            axis.reflow(axisBox);
            equal(axis.box.height(), 70 + ACTUAL_TICK_SIZE + MARGIN);
        });

        test("only labels with height that can be fitted in the container box are taken into account", function() {
            axis.labels.push(new LabelMock(Box2D(0, 0, 20, 101 - ACTUAL_TICK_SIZE - MARGIN)));
            axis.reflow(axisBox);
            equal(axis.box.height(), 30 + ACTUAL_TICK_SIZE + MARGIN);
        });

        test("only labels with height that can be fitted in the container box including the title are taken into account", function() {
            axis.title = new LabelMock(Box2D(0, 0, 20, 40));
            axis.labels.push(new LabelMock(Box2D(0, 0, 20, 61 - ACTUAL_TICK_SIZE - MARGIN)));
            axis.reflow(axisBox);
            equal(axis.box.height(), 70 + ACTUAL_TICK_SIZE + MARGIN);
        });

        test("sets label rotation origin to top", function() {
            axis.reflow(axisBox);
            equal(axis.labels[0].options.rotationOrigin, "top");
        });

        test("sets label rotation origin to bottom if labels are mirrored", function() {
            axis.options.labels.mirror = true;
            axis.reflow(axisBox);
            equal(axis.labels[0].options.rotationOrigin, "bottom");
        });

        // ------------------------------------------------------------
        module("Category Axis / Vertical / reflow", {
            setup: function() {
                axis = new CategoryAxis({
                    categories: ["foo", "bar"],
                    vertical: true,
                    margin: MARGIN
                });
                axis.parent = {
                    box: new Box2D(0, 0, 100, 100),
                    getRoot: function() {
                        return this;
                    }
                };
                axisBox = new Box2D(0, 0, 50, 50);
                axis.labels = [new LabelMock(Box2D(0, 0, 20, 20)), new LabelMock(Box2D(0, 0, 30, 20))];
                axis.getActualTickSize = function() {
                    return ACTUAL_TICK_SIZE;
                };
            }
        });

        test("box width is equal to the maximum label width plus the tick size plus the margin", function() {
            axis.reflow(axisBox);
            equal(axis.box.width(), 30 + ACTUAL_TICK_SIZE + MARGIN);
        });

        test("box width includes title width if title is set", function() {
            axis.title = new LabelMock(Box2D(0, 0, 40, 20));
            axis.reflow(axisBox);
            equal(axis.box.width(), 70 + ACTUAL_TICK_SIZE + MARGIN);
        });

        test("only labels with width that can be fitted in the container box are taken into account", function() {
            axis.labels.push(new LabelMock(Box2D(0, 0, 101 - ACTUAL_TICK_SIZE - MARGIN, 20)));
            axis.reflow(axisBox);
            equal(axis.box.width(), 30 + ACTUAL_TICK_SIZE + MARGIN);
        });

        test("only labels with width that can be fitted in the container box including the title are taken into account", function() {
            axis.title = new LabelMock(Box2D(0, 0, 40, 20));
            axis.labels.push(new LabelMock(Box2D(0, 0, 61 - ACTUAL_TICK_SIZE - MARGIN, 20)));
            axis.reflow(axisBox);
            equal(axis.box.width(), 70 + ACTUAL_TICK_SIZE + MARGIN);
        });

        test("sets label rotation origin to right", function() {
            axis.reflow(axisBox);
            equal(axis.labels[0].options.rotationOrigin, "right");
        });

        test("sets label rotation origin to bottom if labels are mirrored", function() {
            axis.options.labels.mirror = true;
            axis.reflow(axisBox);
            equal(axis.labels[0].options.rotationOrigin, "left");
        });

    })();

    (function() {
        var axisBox;
        var axis;

        function LabelMock(box) {
            this.box = box;
            this.options = {};
            this.reflow = $.noop;
        }

        function setupAxis(options) {
            axis = new CategoryAxis(kendo.deepExtend({
                categories: ["foo", "bar"],
                vertical: false,
                labels: {
                    rotation: "auto"
                }
            }, options));
            axisBox = new Box2D(0, 0, 50, 50);
            axis.labels = [new LabelMock(Box2D(0, 0, 20, 20)), new LabelMock(Box2D(0, 0, 30, 20))];
        }

        // ------------------------------------------------------------
        module("Category Axis / autoRotateLabels", {
            setup: function() {
                setupAxis();
            }
        });

        test("rotates labels with -45 degrees if there is a label with width bigger than the slot width", function() {
            axis.reflow(axisBox);
            axis.autoRotateLabels();

            equal(axis.labels[0].options.rotation, -45);
            equal(axis.labels[1].options.rotation, -45);
        });

        test("rotates labels with -90 degrees if there is a label with height bigger than the slot width", function() {
            axis.labels[1].box.y2 = 30;
            axis.reflow(axisBox);
            axis.autoRotateLabels();

            equal(axis.labels[0].options.rotation, -90);
            equal(axis.labels[1].options.rotation, -90);
        });

        test("does not rotate labels with -90 degrees if there is a label with height bigger than the slot width but its width is smaller", function() {
            axis.labels[1].box.x2 = 20;
            axis.labels[1].box.y2 = 30;
            axis.reflow(axisBox);
            axis.autoRotateLabels();

            ok(!axis.labels[0].options.rotation);
            ok(!axis.labels[1].options.rotation);
        });

        test("reflows rotated labels", 2, function() {
            axis.reflow(axisBox);
            axis.labels[0].reflow = axis.labels[1].reflow = function() {
                ok(true);
            };
            axis.autoRotateLabels();
        });

        test("does not rotate labels if there isn't a label with width bigger than the slot width", function() {
            axis.labels[1].box.x1 = 20;
            axis.reflow(axisBox);
            axis.autoRotateLabels();

            ok(!axis.labels[0].options.rotation);
            ok(!axis.labels[1].options.rotation);
        });

        test("does not rotate labels if the axis is vertical", function() {
            axis.options.vertical = true;
            axis.reflow(axisBox);
            axis.autoRotateLabels();

            ok(!axis.labels[0].options.rotation);
            ok(!axis.labels[1].options.rotation);
        });

        test("does not rotate labels if auto rotation is not enabled", function() {
            setupAxis({
                labels: {
                    rotation: 0
                }
            });
            axis.reflow(axisBox);
            axis.autoRotateLabels();

            ok(!axis.labels[0].options.rotation);
            ok(!axis.labels[1].options.rotation);
        });
    })();

})();