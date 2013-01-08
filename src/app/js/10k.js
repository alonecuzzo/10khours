/*
 *    My Backbone application that will log the number of hours spent on a task, habit, hobby or craft.!
 *
 *    Jabari Bell jabari.bell@23b.it
 *    27-11-12
 */


/*
 *    Waits for jquery ready event.
 */
$(function() {
    /**
     * Constants for animation.
     */
    var ANIMATION_FADE_TIME = 150,
        DURATION = 100,
        JQUERYUI_EASING = "easeInQuart";


    // Task Model
    // -----------
    window.Task = Backbone.Model.extend({

        /**
         * Sets default variables for the model.
         * @return {Backbone.Model}
         */
        defaults: function() {
            return {
                title: 'default value',
                displayTime: '0:00:00',
                order: Tasks.nextOrder(),
                sessions: [],
                totalTime: 0
            };
        },

        /**
         * Gets called once the Model is initialized.
         */
        initialize: function() {
            this.set({
                'isRecording': false
            });
            this.set('displayTime', '0:00:00');
            this.set('totalTime', this.getTotalTime(Date.today().last().sunday().getTime()));
        },

        /**
         * Updates the display time that's displayed in a task view.
         * @param  {string} stringToPrint The string to print.
         */
        updateDisplayTime: function(stringToPrint) {
            this.set('displayTime', stringToPrint);
            this.set('totalTime', this.getTotalTime(Date.today().last().sunday().getTime()));
            this.save();
        },

        // when start is called, add a new session to the sessions array and then call play() on it
        /**
         * Creates a session object and adds it to the sessions array.  It also starts the session.
         */
        startSession: function() {
            this.set({
                'isRecording': true
            });
            this.set({
                'justStopped': false
            });
            this.set('displayTime', '0:00:00');
            var sessions = this.get('sessions'),
                self = this;
            // instead of keeping a session model, let's just create a session object and keep it in an array
            var session = {

                totalTime: 0,

                startDate: new Date().getTime(),

                endDate: Number.MAX_VALUE,

                // this is the setInterval function that runs the timer
                timerInterval: null,

                /**
                 * Starts the timer for the session and formats the string that needs to be printed.
                 */
                startSession: function() {
                    var seconds = 0;
                    var instance = this;
                    this.timerInterval = setInterval(function() {
                        seconds += 1;
                        instance.totalTime = seconds;
                        var stringToPrint = (new Date()).clearTime().addSeconds(seconds).toString('H:mm:ss');
                        self.updateDisplayTime(stringToPrint);
                    }, 1000);
                },

                /**
                 * Stops session.
                 */
                stopSession: function() {
                    clearInterval(this.timerInterval);
                }
            };
            this.set('currentSession', session);
            session.startSession();
            sessions.push(session);
        },

        /**
         * Stops current active session.  Sets an end date for the session and also updates the displayTime, isRecording, and totalTime variables.  The getTotalTime() function should be passed different start dates/times depending upon which mode (day/week/total 10k time) that the app is currently in
         */
        stopSession: function() {
            var currentSession = this.get('currentSession'),
                sinceDate = Date.today().getTime();
            // sinceDate = Date.today().last().sunday().getTime();
            this.set({
                'justStopped': true
            });
            currentSession.endDate = new Date().getTime();
            currentSession.stopSession();
            this.set('totalTime', this.getTotalTime(sinceDate));
            this.set({
                'isRecording': false
            });
            this.set('displayTime', '0:00:00');
            this.set('currentSession', null);
            this.save();
        },

        addSession: function(session) {
            var newSessions = this.get('sessions');
            newSessions.push(session);
            // this.get('sessions').push(session);
            this.set('sessions', newSessions);
            this.set('lastSessionAdded', session);
            this.set('lastSessionAdded', null);
            this.save();
        },

        /**
         * Returns the total number of seconds stored in the sessions array.
         * @param  {int} sinceDate The date (Unix formatted) that the total time should be measured since.
         * @return {int}
         */
        getTotalTime: function(sinceDate) {
            var i,
            sd = 0,
                sum = 0,
                sessions = this.get('sessions'),
                sessionsLen = sessions.length;
            if (sinceDate > 0) {
                sd = sinceDate;
            }
            for (i = 0; i <= sessionsLen - 1; i++) {
                if (sessions[i].endDate > sd) {
                    sum += parseInt(sessions[i].totalTime, 10);
                }
            }
            return sum;
        },

        /**
         * Returns the percentage of 10,800 seconds logged today for a given task.
         * @return {float}
         */
        getDailyPercentage: function() {
            var dailyTotalSeconds = 10800, // 10800 seconds in 3 hours which is daily amount needed
                totalDailyTime = this.getTotalTime(Date.today().getTime()),
                returnPercentage = Math.round((totalDailyTime / dailyTotalSeconds) * 100) / 100;
            if (returnPercentage < 0.05) {
                returnPercentage = 0.05;
            }
            if (returnPercentage > 1.0) {
                returnPercentage = 1.0;
            }
            return returnPercentage * 100;
        },

        /**
         * Returns the percentage of 68,400 seconds logged this week for a given task.
         * @return {float}
         */
        getWeeklyPercentage: function() {
            var weeklyTotalSeconds = 68400, // 19 hours per week to hit 10,000 hours in 10 years
                totalWeeklyTime = this.getTotalTime(Date.today().last().sunday().getTime());
            return Math.round((totalWeeklyTime / weeklyTotalSeconds) * 100) / 100;
        },

        /**
         * Matches model's order property to the proper index in the view.
         * @param  {Number} index Index of View in list.
         */
        matchOrderIndex: function(index) {
            this.set('order', index);
            this.save();
        }
    });

    // Tasks Collection
    // ----------------
    var TaskList = Backbone.Collection.extend({

        model: window.Task,

        // hack to keep track of location of currently dragging item
        currentPlaceholderIndex: Number.MAX_VALUE,

        localStorage: new Backbone.LocalStorage("tasks-backbone"),

        /**
         * Assigns order to Task object.
         * @return {Number}
         */
        nextOrder: function() {
            if (!this.length) {
                return 0;
            }
            return this.last().get('order') + 1;
        },

        /**
         * Function that assigns value for ordering.
         * @return {Number} Returns Task's order value.
         */
        comparator: function(task) {
            return task.get('order');
        },

        // keeps track of the presence of an active session
        /**
         * Keeps track of the presence of an active session.
         * @param  {Task} task The current Task object that has a session recording.
         */
        logStartSession: function(task) {
            this.activeSession = task;
        },

        /**
         * Sets the active session to null since there is no longer a session playing.
         */
        logStopSession: function() {
            this.activeSession = null;
        },

        /**
         * Stops the active function if one exists.
         */
        stopActiveSession: function() {
            if (this.activeSession) {
                this.activeSession.stopSession();
            }
        },

        /**
         * Removes model at updateModelAtOrder value, reinserts it at updateModelWithOrder in the this.models array, and then it scrolls through them and updates the orders of the models.
         * @param  {Number} updateModelAtOrder   The order that the model of interest contains that needs to be updated.
         * @param  {Number} updateModelWithOrder The new order of the model given its repositioning in the list.
         */
        updateListOrder: function(updateModelAtOrder, updateModelWithOrder) {
            var modelToChange;
            _.each(this.models, function(task) {
                if (task.get('order') === updateModelAtOrder) {
                    modelToChange = task;
                }
            });
            if (modelToChange) {
                this.models.splice(_.indexOf(this.models, modelToChange), 1);
                this.models.splice(this.models.length - updateModelWithOrder, 0, modelToChange);
                var i;
                for (i = 0; i <= this.models.length - 1; i++) {
                    this.models[i].set('order', i);
                    this.models[i].save();
                }
            }
        }
    });

    // Instantiate collection.
    var Tasks = new TaskList();


    // Task Item View
    // --------------
    var TaskView = Backbone.View.extend({

        tagName: 'li',

        // cache the template function for a single item
        template: _.template("<div class='view' id='item'><div id='item-template'><div id='task-title'><%- title %></div><div id='task-display-time'><%- displayTime %></div><div id='task-total-time'>Total time: <%- totalTime %></div><div class='ui-progress-bar blue ui-container'><div class='ui-progress'></div></div><a class='destroy'></a></div></div></div>"),

        // events to listen to
        events: {
            'mousemove': 'onMouseMove',
            'mousedown': 'onMouseDown',
            'mouseup': 'onMouseClick',
            'mouseenter': 'onMouseOver',
            'mouseleave': 'onMouseOut'
        },

        /**
         * Initialize view.
         */
        initialize: function() {
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this);
            this.hasBeenDragged = false;
            this.mousedown = false;
        },

        /**
         * Renders the view.
         * @return {Backbone.View}
         */
        render: function() {
            var $element = this.$el;
            $element.html(this.template(this.model.toJSON()));
            var $uiProgressBar = $($element).find('.ui-progress'),
                $displayTime = $($element).find('#task-display-time'),
                barPercentage = this.model.getDailyPercentage();
            $uiProgressBar.width(barPercentage + '%');
            if (this.model.get('justStopped') === true) {
                this.model.set({
                    'justStopped': false
                });
                this.delegateEvents(this.events);
                this.onMouseOut();
            }

            if (this.model.get('isRecording') === true) {
                $displayTime.show();
            } else {
                $displayTime.hide();
            }
            return this;
        },

        /**
         * Handles showing edit view.
         */
        onMouseDoubleClick: function() {
            window.location = '/#task/' + this.model.get('order');
        },

        /**
         * Fades rollover effect out.
         */
        onMouseOut: function() {
            var $element = $(this.$el),
                $displayTime = $element.find('#task-display-time');
            $element.animate({
                backgroundColor: '#FFFFFF'
            }, 100);
            $element.animate({
                borderColor: '#CCCCCC'
            }, 100);
            $element.css({
                color: '#666666'
            }, 100);
        },

        /**
         * Fades rollover effect in.
         */
        onMouseOver: function() {
            var $element = $(this.$el);
            $element.css({
                borderColor: '#9a63f5',
                backgroundColor: '#418fdc',
                color: '#F7F7F7'
            });
        },

        /**
         * Catches mouse click and handles whether it should listen for a double click or treat the click as a single click.
         */
        onMouseClick: function() {
            var instance = this;
            this.mousedown = false;
            if (this.alreadyClicked) {
                // handle double click
                this.alreadyClicked = false;
                clearTimeout(this.alreadyClickedTimeout);
                this.onMouseDoubleClick();
            } else {
                // handle single click business
                // wait 300ms, if no second click reset everything
                this.alreadyClicked = true;
                this.alreadyClickedTimeout = setTimeout(function() {
                    instance.alreadyClicked = false;
                    instance.startSession();
                }, 300);
            }
        },

        /**
         * Determines if the mouse is down and the Task is being dragged in the list.
         */
        onMouseMove: function() {
            if (this.mousedown === true) {
                this.hasBeenDragged = true;
            }
        },

        /**
         * Tracks the this.mousedown variable.  This is neccessary to see if a Task has been just dragged & dropped.  If it has then we don't want it to fire off the startSession() function once it's released.
         */
        onMouseDown: function() {
            this.mousedown = true;
        },

        /**
         * Clear the double click interval.
         * @return {[type]} [description]
         */
        clearDoubleClickInterval: function() {
            clearInterval(this.alreadyClickedTimeout);
        },

        /**
         * Animates the Task View between its default state and the active recording state.
         * @param  {object} $element The current $el object.
         * @param  {boolean} out      Whether the task needs to be faded out or not.
         */
        animateSelectedTask: function($element, out) {
            var targetBackgroundColor = '#FFFFFF',
                targetBorderColor = '#CCCCCC',
                targetFontColor = '#666',
                targetDisplay = 'inline';
            if (out === true) {
                targetBackgroundColor = '#9a63f5';
                targetBorderColor = '#773fd3';
                targetFontColor = '#FFFFFF';
            }
            $element.animate({
                backgroundColor: targetBackgroundColor
            }, ANIMATION_FADE_TIME);
            $element.animate({
                color: targetFontColor
            }, 10);
            $element.css({
                borderColor: targetBorderColor
            });
        },

        /**
         * Keeps track of dragging state for TaskView.
         */
        setDraggingFalse: function() {
            this.isDragging = false;
            this.undelegateEvents();
            this.delegateEvents(this.events);
            this.hasBeenDragged = true;
        },

        /**
         * Starts the session recording for the current model associated with this TaskView.  Checks to see if the current model is recording, and if it has just been dragged.  If it's just been dragged and then dropped, we don't want it to start recording.
         */
        startSession: function() {
            var newIndex = Tasks.currentPlaceholderIndex,
                currentOrder = this.model.get('order');
            if (this.model.get('isRecording') !== true && this.hasBeenDragged !== true) {
                // if there is a current session running, we need to stop it
                this.undelegateEvents();
                this.delegateEvents({
                    'mouseup': 'stopSession'
                });
                Tasks.stopActiveSession();
                Tasks.logStartSession(this.model);
                this.model.startSession();
                var $element = $(this.$el);
                this.animateSelectedTask($element, true);
            } else if (this.hasBeenDragged === true) {
                //just update the order on the list models
                Tasks.updateListOrder(currentOrder, newIndex);
            }
            Tasks.currentPlaceholderIndex = Number.MAX_VALUE;
            this.hasBeenDragged = false;
            this.mousedown = false;
        },

        /**
         * If the TaskView is currently recording then stop the recording.
         */
        stopSession: function() {
            if (this.model.get('isRecording') === true) {
                this.undelegateEvents();
                this.delegateEvents(this.events);
                Tasks.logStopSession();
                this.model.stopSession();
                var $element = $(this.$el);
                this.animateSelectedTask($element, false);
            }
        },

        /**
         * Close and save values to the model.
         */
        close: function() {

        },

        /**
         * Remove the TaskView and destroy the model.
         */
        clear: function() {
            this.model.destroy();
        }
    });

    // TaskDetailView
    // -----------
    var TaskDetailView = Backbone.View.extend({

        template: _.template('<div class="task-detail-view-header-wrapper"><div class="title-wrapper"><div class="task-detail-view-title"><%- title %></div><div class="task-actions"><div class="add-time"><a class="add-time-btn" rel="popover" data-placement="right" data-original-title="Add Time to Task" href="#"><i class="icon-time icon-dark-purple"></i>Add Time</a></div><div class="modify-task"><a class="" href="#"><i class="icon-edit icon-dark-purple"></i>Edit Task</a></div><div class="delete-task"><a class="delete-task-btn" el="popover" data-placement="right" data-original-title="Confirm Task Deletion" href="#"><i class="icon-trash icon-dark-purple"></i>Delete Task</a></div></div></div><div class="task-detail-stats"><div class="header-text"><i class="icon-signal"></i>Stats at a glance</div><div class="stat-text"><div class="total-hours-text">34 hours</div><div class="sessions-recorded-text">3 sessions</div><div class="daily-goal-text">1 hour</div></div><div class="label-text"><div class="total-hours">so far</div><div class="sessions-recorded">recorded</div><div class="daily-goal">daily goal</div></div></div></div><div class="detail-btn-bar-calendar clearfix"><div id="task-detail-btn-bar" class="btn-group"><button id="calendar-tab-btn" class="btn btn-large active"><i class="icon-calendar"></i>Calendar</button><button id="stats-tab-btn" class="btn btn-large"><i class="icon-signal"></i>Stats</button></div><div id="calendar"></div><div id="charts-view-inner"></div></div>'),

        events: {
            'click .modify-task a': 'onEdit',
            'click .add-time a': 'onAddTime',
            'click .delete-task a': 'onDeleteClick',
            'click .date-picker': 'onDatePicker',
            'click #add-time-confirm-btn': 'onAddTimeConfirmClick',
            'click #add-time-cancel-btn': 'onAddTimeCancelClick',
            'click #delete-task-confirm-btn': 'onDeleteConfirmationClick',
            'click #delete-task-cancel-btn': 'onDeleteCancelClick',
            'click #calendar-tab-btn': 'onCalendarTabButtonClick',
            'click #stats-tab-btn': 'onStatsTabButtonClick'
        },

        onCalendarTabButtonClick: function(e) {
            $('#stats-tab-btn').removeClass('active');
            $('#calendar-tab-btn').addClass('active');
            $('#calendar').fadeIn(200);
            $('#charts-view').fadeOut(200);
        },

        onStatsTabButtonClick: function(e) {
            $('#stats-tab-btn').addClass('active');
            $('#calendar-tab-btn').removeClass('active');
            $('#calendar').fadeOut(200);
            $('#charts-view').fadeIn(200);
        },

        onDatePicker: function(e) {
            $('#dp').datepicker();
        },

        onAddTimeConfirmClick: function(e) {
            var $element = $(this.$el),
                numSecondsToAdd = ($element.find('.add-time-hours').val() * 3600) + ($element.find('.add-time-minutes').val() * 60),
                dateToAddTo = Date.parse($element.find('.add-time-date').val()),
                session = {
                    totalTime: numSecondsToAdd,
                    startDate: dateToAddTo.getTime(),
                    endDate: dateToAddTo.getTime() + numSecondsToAdd
                };

            if (session) {
                this.model.addSession(session);
            }
            $('.add-time-btn').popover('hide');
        },

        onAddTimeCancelClick: function(e) {
            $('.add-time-btn').popover('hide');
        },

        onAddTime: function(e) {
            e.preventDefault();
            var $element = $(this.$el);
            $element.find('.add-time-btn').popover('toggle');
        },

        onDeleteClick: function(e) {
            e.preventDefault();
            $(this.$el).find('.delete-task-btn').popover('toggle');
        },

        onDeleteConfirmationClick: function(e) {
            e.preventDefault();
            this.model.destroy();
            window.location = '#';
        },

        onDeleteCancelClick: function(e) {
            e.preventDefault();
            $(this.$el).find('.delete-task-btn').popover('hide');
        },

        onEdit: function(e) {
            e.preventDefault();
            window.location = '#/task/edit/' + this.model.get('order');
        },

        /**
         * Initialize view.
         */
        initialize: function() {

        },

        modelChanged: function() {
            window.location = '#task/refresh-detail/' + this.model.get('order');
        },

        /**
         * Renders the view.
         * @return {Backbone.View}
         */
        render: function() {
            var $element = $(this.$el),
                totalHours = Math.round((this.model.getTotalTime() / 3600) * 100) / 100;
            $element.html(this.template(this.model.toJSON()));

            this.model.on('change', this.modelChanged, this);

            $element.find('.add-time-btn').popover({
                content: '<div class="input-append date date-picker" id="dp3" data-date="12-02-2013" data-date-format="mm-dd-yyyy"><input class="span2 add-time-date" id="dp" type="text"><span class="add-on"><i class="icon-calendar"></i></span></div><div class="input-append"><input class="span2 add-time-hours" type="text" id="appendedInput" placeholder="Hours"><span class="add-on">hours</span></div><div class="input-append"><input class="span2 add-time-minutes" type="text" id="appendedInput" placeholder="Minutes"><span class="add-on">minutes</span></div><button id="add-time-confirm-btn"class="btn btn-success">Confirm</button><button id="add-time-cancel-btn" class="btn">Cancel</button>',
                html: true
            });

            $element.find('.delete-task-btn').popover({
                content: '<button id="delete-task-confirm-btn" class="btn btn-success">Confirm</button><button id="delete-task-cancel-btn" class="btn">Cancel</button>',
                html: true
            });

            if (typeof this.chartView === 'undefined') {
                this.chartView = new ChartView();
                $('#charts-view-inner').append(this.chartView.render().el);
            }

            $element.find('.total-hours-text').text(totalHours + ' hours');
            $element.find('.sessions-recorded-text').text(this.model.get('sessions').length + ' sessions');
            $('#charts-view').hide();
            $element.find('#calendar').datepicker({
                inline: true,
                firstDay: 1,
                showOtherMonths: true,
                dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                isRolloverCalendar: true,
                rolloverTitle: 'Stats',
                onRefreshFunction: this.onCalendarRefresh,
                element: $element,
                model: this.model,
                view: this
            });

            //console.debug('model: ' + JSON.stringify(this.model));

            this.onCalendarRefresh($element, this.model, this);

            return this;
        },

        onCalendarRefresh: function($element, model, view) {
            $('#calendar td').addClass('ui-datepicker-unselectable');
            if (model !== undefined) {
                var sessionsRecordedThisMonth = [],
                    calendarMonth = Date.getMonthNumberFromName($('.ui-datepicker-month').text()),
                    calendarYear = parseInt($('.ui-datepicker-year').text(), 10),
                    i;
                if (calendarMonth < 0) {
                    calendarMonth = new Date().getMonth();
                }
                if (!calendarYear) {
                    calendarYear = new Date().getFullYear();
                }
                for (i = 0; i <= model.get('sessions').length - 1; i++) {
                    var startDate = new Date(parseInt(model.get('sessions')[i].startDate, 10));
                    if (startDate.getMonth() === calendarMonth && startDate.getFullYear() === calendarYear) {
                        sessionsRecordedThisMonth.push(startDate);
                    }
                }
                for (i = 0; i <= sessionsRecordedThisMonth.length - 1; i++) {
                    $element.find('#calendar td a').filter(function() {
                        return parseInt($(this).text(), 10) === sessionsRecordedThisMonth[i].getDate();
                    }).addClass('calendar-stopwatch').attr('el', 'popover').attr('data-placement', 'top');
                }

                $element.find('#calendar td a').on('mouseleave', view.onCalendarDateMouseLeave);
                $element.find('#calendar td a').on('mouseenter', {
                    model: model,
                    view: view
                }, view.onCalendarDateMouseEnter);
            }
        },

        onCalendarDateMouseEnter: function(e) {
            //console.debug($(this).text() + ' ' + $('.ui-datepicker-month').text() + ' ' + $('.ui-datepicker-year').text());
            var sessionsRecordedToday = [],
                $element = $(e.data.view.$el),
                calendarMonth = Date.getMonthNumberFromName($element.find('.ui-datepicker-month').text()),
                calendarYear = parseInt($element.find('.ui-datepicker-year').text(), 10),
                calendarDate = parseInt($(this).text(), 10),
                totalSeconds = 0;
            for (i = 0; i <= e.data.model.get('sessions').length - 1; i++) {
                var startDate = new Date(parseInt(e.data.model.get('sessions')[i].startDate, 10));
                if (startDate.getMonth() === calendarMonth && startDate.getFullYear() === calendarYear && startDate.getDate() === calendarDate) {
                    sessionsRecordedToday.push(startDate);
                    totalSeconds += e.data.model.get('sessions')[i].totalTime;
                }
            }
            if (sessionsRecordedToday.length > 0) {
                var totalHours = Math.round((totalSeconds / 3600) * 100) / 100;
                $(this).popover({
                    title: $element.find('.ui-datepicker-month').text() + ' ' + $(this).text() + ', ' + $element.find('.ui-datepicker-year').text(),
                    content: '<div class="popover-content"><p>' + totalHours + ' hours recorded</p><p>' + sessionsRecordedToday.length + ' sessions</p></div>',
                    html: true
                });
                $(this).popover('show');
            }
        },

        onCalendarDateMouseLeave: function(e) {
            $(this).popover('hide');
        },

        setModel: function(model) {
            this.model = model;
            // this.render();
        },

        close: function() {
            var $element = $(this.$el);
            $element.find('#calendar').datepicker('destroy');
            $element.find('#calendar td a').unbind('mouseleave', this.onCalendarDateMouseLeave);
            $element.find('#calendar td a').unbind('mouseenter', {
                model: this.model
            }, this.onCalendarDateMouseEnter);
            this.chartView.close();
            this.chartView = null;
            this.remove();
            this.unbind();
            this.model.unbind('change', this.modelChanged);
        }
    });

    var TaskDetail;

    // ChartView
    // -----------

    var ChartView = Backbone.View.extend({

        el: $('#charts-view'),

        events: {
            // events
        },

        /**
         * Initialize view.
         */
        initialize: function() {
            //init code here
            this.r = new Raphael(this.el, 620, 500);
        },

        /**
         * Renders the view.
         * @return {Backbone.View}
         */
        render: function() {
            this.r.barchart(0, 0, 620, 260, [76, 70, 67, 71, 69, 21, 33], {
                colors: ['#9a63f5', '#9a63f5', '#9a63f5', '#9a63f5', '#9a63f5', '#9a63f5', '#9a63f5']
            });
            return this;
        },

        close: function() {
            this.r.remove();
            this.r = null;
        }
    });

    // EditTaskView
    // -----------

    var EditTaskView = Backbone.View.extend({

        template: _.template('<p class="section-heading">Edit Task</p><form><p class="form-label">Task Name:</p><input class="input-xlarge" type="text" placeholder="<%- title %>"><p class="form-label">How often would you like to repeat this task?</p><div class="btn-toolbar"><div class="btn-group"><button class="btn">S</button><button class="btn">M</button><button class="btn active">T</button><button class="btn">W</button><button class="btn">T</button><button class="btn">F</button><button class="btn">S</button></div></div><p class="form-label">Intervals</p><div class="checkbox-section"><label class="checkbox"><input type="checkbox" id="intervalOption1">Every day</label><label class="checkbox"><input type="checkbox" id="intervalOption2">Every 2 days</label><label class="checkbox"><input type="checkbox" id="intervalOption3">Every 2-3 days</label><label class="checkbox"><input type="checkbox" id="intervalOption4">Every 3 days</label><label class="checkbox"><input type="checkbox" id="intervalOption5">Every 3-5 days</label></div><p class="form-label">Non-specific days</p><div class="checkbox-section nonspecific"><label class="checkbox"><input type="checkbox" id="nonSpecificOption1">1 day per week</label><label class="checkbox"><input type="checkbox" id="nonSpecificOption2">2 days per week</label><label class="checkbox"><input type="checkbox" id="nonSpecificOption3">3 days per week</label><label class="checkbox"><input type="checkbox" id="nonSpecificOption4">4 days per week</label><label class="checkbox"><input type="checkbox" id="nonSpecificOption5">5 days per week</label><label class="checkbox"><input type="checkbox" id="nonSpecificOption6">6 days per week</label></div><p><button class="btn">Save</button><button class="btn">Cancel</button></p></form>'),

        events: {
            // events
        },

        /**
         * Initialize view.
         */
        initialize: function() {
            //init code here
        },

        /**
         * Renders the view.
         * @return {Backbone.View}
         */
        render: function() {
            var $element = $(this.$el);
            $element.html(this.template(this.model.toJSON()));
            //render code
            return this;
        },

        setModel: function(model) {
            this.model = model;
            this.render();
        }
    });

    var EditTask;

    // Application
    // -----------
    var AppView = Backbone.View.extend({

        el: $('#tasks-list-view'),

        /**
         * Initialize.
         */
        initialize: function() {
            this.input = this.$('#new-task');
            Tasks.on('add', this.addOne, this);
            Tasks.on('reset', this.addAll, this);
            Tasks.fetch();
        },

        /**
         * Render View
         */
        render: function() {},

        events: {
            'keypress #new-task': 'createOnEnter'
        },

        /**
         * Adds a TaskView to the AppView
         * @param {Backbone.Model} task The current model that should be rendered to a view.
         */
        addOne: function(task) {
            var view = new TaskView({
                model: task
            });
            this.$('#task-list').prepend(view.render().el);
        },

        /**
         * Add all of the models in the Collection to the View.
         */
        addAll: function() {
            Tasks.each(this.addOne);
        },

        /**
         * Creates a new Task when the enter key is pressed.
         * @param  {Event} e Keyboard event.
         */
        createOnEnter: function(e) {
            if (e.keyCode !== 13) {
                return;
            }
            if (!this.input.val()) {
                return;
            }
            Tasks.create({
                title: this.input.val()
            });
            this.input.val('');
        }
    });

    // create the app
    var App = new AppView();
    // app router stuff
    // note that the router catches anything past the # sign, http://localhost:4567/#tasks/3 for example
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'getAllTasks',
            'task/:id': 'getTask',
            'task/edit/:id': 'editTask',
            'task/refresh-detail/:id': 'refreshDetail'
        }
    });

    var appRouter = new AppRouter();
    appRouter.on('route:getTask', function(id) {

        if ($('.task-detail-view-container').is(':visible')) {
            if (TaskDetail) {
                TaskDetail.close();
                TaskDetail = null;
            }
            _.each(Tasks.models, function(model) {
                if (parseInt(model.get('order'), 10) === parseInt(id, 10)) {
                    TaskDetail = new TaskDetailView({
                        model: model
                    });
                    $('#task-detail-view').append(TaskDetail.render().el);
                }
            });
            return;
        }

        var $divToFade = ($('#tasks-list-view').is(':visible')) ? $('#tasks-list-view') : $('.edit-task-view-container');
        $divToFade.fadeOut(200, function() {
            _.each(Tasks.models, function(model) {
                if (parseInt(model.get('order'), 10) === parseInt(id, 10)) {
                    if (TaskDetail) {
                        TaskDetail.close();
                        TaskDetail = null;
                    }
                    TaskDetail = new TaskDetailView({
                        model: model
                    });
                    $('#task-detail-view').append(TaskDetail.render().el);
                }
            });
            $('.task-detail-view-container').fadeIn(200);
            $('#grey-bkgrnd').fadeIn(200);
            $('#grey-bkgrnd').height($('.main').height());
        });
        $('#grey-bkgrnd').animate({
            marginTop: 165
        }, 300);
        $('.alerts').fadeOut(0);
        $('.delete-task-alert').fadeOut(0);
    });

    /**
     * Catches detail id and forces it to refresh from model.  Wasn't able to get calendar to refresh from just a plain change event... a bit of a hack to get it working. jb 8.1.13
     * @param  {[type]} id) {                   window.location = '#/task/' + id;    } [description]
     * @return {[type]}     [description]
     */
    appRouter.on('route:refreshDetail', function(id) {
        window.location = '#/task/' + id;
    });

    appRouter.on('route:getAllTasks', function(id) {
        $('#grey-bkgrnd').fadeOut(200);
        var $divToFade = ($('.task-detail-view-container').is(':visible')) ? $('.task-detail-view-container') : $('.edit-task-view-container');
        $divToFade.fadeOut(200, function() {
            $(App.el).fadeIn(200);
            //make sure you call close on views to unbind listeners!
            if (typeof TaskDetail !== 'undefined') {
                TaskDetail.close();
                TaskDetail = null;
            }
        });
        $('.alerts').fadeOut(0);
        $('.delete-task-alert').fadeOut(0);
    });

    appRouter.on('route:editTask', function(id) {
        // right now only handling detailview -> edit view, will need to know which views to fade in/out dynamically eventually
        var $divToFade = ($('.task-detail-view-container').is(':visible')) ? $('.task-detail-view-container') : $('#tasks-list-view');
        $divToFade.fadeOut(200, function() {
            _.each(Tasks.models, function(model) {
                if (parseInt(model.get('order'), 10) === parseInt(id, 10)) {
                    if (!EditTask) {
                        EditTask = new EditTaskView({
                            model: model
                        });
                        $('#edit-task-view').append(EditTask.render().el);
                    } else {
                        EditTask.setModel(model);
                    }
                }
            });
            $('.edit-task-view-container').fadeIn(200);
            $('#grey-bkgrnd').fadeIn(200);
            $('#grey-bkgrnd').height($('.main').height());
        });
        $('#grey-bkgrnd').animate({
            marginTop: 98
        }, 300);
        $('.alerts').fadeOut(0);
        $('.delete-task-alert').fadeOut(0);
    });

    Backbone.history.start();

    // jQuery ui sortable stuff for drag & drop functionality
    // -----------
    $('#task-list').sortable({
        start: function(e, ui) {
            $(ui.placeholder).hide(100);
            // was looking to fix that index not updating properly issue here: http://stackoverflow.com/questions/4956039/jquery-sortable-change-event-element-position
            var start_pos = ui.item.index();
            ui.item.data('start_pos', start_pos);
        },
        stop: function(e, ui) {},
        forcePlaceholderSize: true,
        change: function(e, ui) {
            $(ui.placeholder).hide().show(100);
            var start_pos = ui.item.data('start_pos'),
                newIndex = ui.placeholder.index();
            if (start_pos < newIndex) {
                newIndex -= 1;
            }
            Tasks.currentPlaceholderIndex = newIndex;
        },
        // will need to style the highlight, check this link for reference: http://jqueryui.com/sortable/#placeholder
        // using this hack to customize look of placeholder: http://stackoverflow.com/questions/2150002/jquery-ui-sortable-how-can-i-change-the-appearance-of-the-placeholder-object
        placeholder: {
            element: function(currentItem) {
                return $('<li></li>')[0];
            },
            update: function(container, p) {
                container.refreshPositions();
                container.placeholder.css('backgroundColor', '#eff6fc');
                container.placeholder.css('borderColor', '#4192d7');
                container.placeholder.css('height', '42px');
                return;
            }
        }
    });

    $('#grey-bkgrnd').height($('.main').height());
    $('#grey-bkgrnd').width($('.main').width());
    $(window).resize(function() {
        $('#grey-bkgrnd').height($('.main').height());
        $('#grey-bkgrnd').width($('.main').width());
    });

    $('#task-list').disableSelection();
});