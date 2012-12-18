/*
 *    My Backbone application that will log the number of hours spent on a task, habit, hobby or craft.
 *
 *    Jabari Bell jabari.bell@23b.it
 *    27-11-12
 */


/*
 *    Waits for jquery ready event.
 */
$(function(){

	/**
	 * Constants for animation.
	 */
	var ANIMATION_FADE_TIME = 150,
		DURATION = 100,
		JQUERYUI_EASING = "easeInQuart";

	// Task Model
	// -----------
	Task = Backbone.Model.extend({

		/**
		 * Sets default variables for the model.
		 * @return {object}
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
			this.set({'isRecording' : false});
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
			this.set({'isRecording' : true});
			this.set({'justStopped' : false});
			this.set('displayTime', '0:00:00');
			var sessions = this.get('sessions');
			var self = this;
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
					this.timerInterval = setInterval(function(){
						seconds += 1;
						instance.totalTime = seconds;
						var stringToPrint = (new Date()).clearTime().addSeconds(seconds).toString('H:mm:ss');
						self.updateDisplayTime(stringToPrint);
						console.log(stringToPrint);
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
			var	currentSession = this.get('currentSession'),
				sinceDate = Date.today().getTime();
				// sinceDate = Date.today().last().sunday().getTime();
			this.set({'justStopped' : true});
			currentSession.endDate = new Date().getTime();
			currentSession.stopSession();
			this.set('totalTime', this.getTotalTime(sinceDate));
			this.set({'isRecording' : false});
			this.set('displayTime', '0:00:00');
			this.save();
			console.log('total time for this activity: ' + this.getTotalTime(sinceDate));
			console.log('weekly percentage: ' + this.getWeeklyPercentage());
			console.log('daily percentage: ' + this.getDailyPercentage());
			console.log('right now: ' + new Date().getTime());
			console.log('since date: ' + sinceDate);
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
			if(sinceDate > 0) sd = sinceDate;
			for(i = 0; i <= sessionsLen - 1; i++) {
				if(sessions[i].endDate > sd) sum += parseInt(sessions[i].totalTime, 10);
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
			if(returnPercentage < 0.05) returnPercentage = 0.05;
			if(returnPercentage > 1.0) returnPercentage = 1.0;
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

		model: Task,

		// hack to keep track of location of currently dragging item
		currentPlaceholderIndex: Number.MAX_VALUE,

		localStorage: new Backbone.LocalStorage("tasks-backbone"),

		/**
		 * Assigns order to Task object.
		 * @return {Number}
		 */
		nextOrder: function() {
			if (!this.length) return 0;
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
			if(this.activeSession) this.activeSession.stopSession();
		},

		/**
		 * Removes model at updateModelAtOrder value, reinserts it at updateModelWithOrder in the this.models array, and then it scrolls through them and updates the orders of the models.
		 * @param  {Number} updateModelAtOrder   The order that the model of interest contains that needs to be updated.
		 * @param  {Number} updateModelWithOrder The new order of the model given its repositioning in the list.
		 */
		updateListOrder: function(updateModelAtOrder, updateModelWithOrder) {
			var modelToChange;
			_.each(this.models, function(task) {
				if(task.get('order') === updateModelAtOrder) modelToChange = task;
			});
			if(modelToChange) {
				this.models.splice(_.indexOf(this.models, modelToChange), 1);
				this.models.splice(this.models.length - updateModelWithOrder, 0, modelToChange);
				var i;
				for(i = 0; i <= this.models.length - 1; i++) {
					this.models[i].set('order', i);
					this.models[i].save();
				}
			}
			// console.log(JSON.stringify(this));
		}
	});

	// Instantiate collection.
	var Tasks = new TaskList();

	// Task Item View
	// --------------
	var TaskView = Backbone.View.extend({
		
		tagName: 'li',

		// cache the template function for a single item
		template: _.template("<div class='view' id='item'><div id='item-template'><div id='task-title'><%- title %></div><div id='task-display-time'><%- displayTime %></div><div id='task-total-time'>Total time: <%- totalTime %></div><div class='ui-progress-bar blue ui-container'><div class='ui-progress'></div></div><a class='destroy'></a></div><input type='text' class='edit' value='' name='' /></div></div>"),

		// events to listen to
		events: {
			'mousemove'     : 'onMouseMove',
			'mousedown'     : 'onMouseDown',
			'mouseup'       : 'startSession',
			'mouseenter'    : 'onMouseOver',
			'mouseleave'    : 'onMouseOut'
		},

		/**
		 * Initialize view.
		 */
		initialize: function() {
			this.model.on('change', this.render, this);
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
				barPercentage = this.model.getDailyPercentage();
			$uiProgressBar.width(barPercentage + '%');
			if(this.model.get('justStopped') === true) {
				this.onMouseOut();
				this.animateSelectedTask($element, false);
				this.model.set({'justStopped' : false});
				this.stopSession();
			}
			return this;
		},

		/**
		 * Fades rollover effect out.
		 */
		onMouseOut: function() {
			// console.log('mouse out');
			var $element = $(this.$el);
			$element.animate({backgroundColor : '#FFFFFF'}, 100);
			$element.animate({borderColor : '#CCCCCC'}, 100);
			$element.css({color : '#666666'}, 100);
		},

		/**
		 * Fades rollover effect in.
		 */
		onMouseOver: function() {
			// console.log('mouse over');
			var $element = $(this.$el);
			$element.css({borderColor : '#9a63f5', backgroundColor : '#418fdc', color : '#F7F7F7'});
			// console.log('onMouseOver index(): ' + $element.index());
			// console.log('onMouseOver get(order): ' + this.model.get('order'));
		},

		/**
		 * Determines if the mouse is down and the Task is being dragged in the list.
		 */
		onMouseMove: function() {
			if(this.mousedown === true) this.hasBeenDragged = true;
		},

		/**
		 * Tracks the this.mousedown variable.  This is neccessary to see if a Task has been just dragged & dropped.  If it has then we don't want it to fire off the startSession() function once it's released.
		 */
		onMouseDown: function() {
			// console.log('onMouseDown called');
			this.mousedown = true;
		},

		/**
		 * Animates the Task View between its default state and the active recording state.
		 * @param  {object} $element The current $el object.
		 * @param  {boolean} out      Whether the task needs to be faded out or not.
		 */
		animateSelectedTask: function($element, out) {
			var targetBackgroundColor = '#FFFFFF',
				targetBorderColor = '#CCCCCC',
				targetFontColor = '#666';
			if(out === true) {
				targetBackgroundColor = '#9a63f5';
				targetBorderColor = '#773fd3';
				targetFontColor = '#FFFFFF';
			}
			console.log('calling animated selected task!');
			$element.animate({backgroundColor : targetBackgroundColor}, ANIMATION_FADE_TIME);
			$element.animate({color : targetFontColor}, 10);
			$element.css({borderColor : targetBorderColor});
		},

		/**
		 * Keeps track of dragging state for TaskView.
		 */
		setDraggingFalse: function() {
			this.isDragging = false;
			this.undelegateEvents();
			console.log('setDraggingFalse called');
			this.delegateEvents(this.events);
			this.hasBeenDragged = true;
		},

		/**
		 * Starts the session recording for the current model associated with this TaskView.  Checks to see if the current model is recording, and if it has just been dragged.  If it's just been dragged and then dropped, we don't want it to start recording.
		 */
		startSession: function() {
			var newIndex = Tasks.currentPlaceholderIndex,
					currentOrder = this.model.get('order');
			if(this.model.get('isRecording') !== true && this.hasBeenDragged !== true) {
				// if there is a current session running, we need to stop it
				this.undelegateEvents();
				this.delegateEvents({'mouseup' : 'stopSession'});
				Tasks.stopActiveSession();
				Tasks.logStartSession(this.model);
				this.model.startSession();
				var $element = $(this.$el);
				this.animateSelectedTask($element, true);
				console.log('my index is: ' + $element.index());
				animateSelectedTaskToTop($element.index(), 0);
				Tasks.updateListOrder(currentOrder, 0);
				$('html, body').animate({ scrollTop: 0 }, 'slow');
			} else if(this.hasBeenDragged === true){
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
			if(this.model.get('isRecording') === true) {
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

	// Application
	// -----------
	var AppView = Backbone.View.extend({
		
		el: $('#tenKhoursapp'),

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
		render: function() {
		},

		events: {
			'keypress #new-task': 'createOnEnter'
		},

		/**
		 * Adds a TaskView to the AppView
		 * @param {Backbone.Model} task The current model that should be rendered to a view.
		 */
		addOne: function(task) {
			var view = new TaskView({model : task});
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
			if (e.keyCode != 13) return;
			if (!this.input.val()) return;
			Tasks.create({title: this.input.val()});
			this.input.val('');
		}
	});
	
	// create the app
	var App = new AppView();
    
    // List Manipulation
	// -----------------
	
	/**
	 * Handles bumping the TaskViews up the list so that the current recording Task is always at the top of the list.
	 * @param  {Number} startIndex       The starting index of the TaskView that needs to be moved.
	 * @param  {Number} destinationIndex The index where the TaskView should be moved to.
	 */
    function animateSelectedTaskToTop(startIndex, destinationIndex) {
        // The number of swaps done so far
        var numberOfSwapsDone = 0;
        var numberOfSwapsToDo = 0;
        
        // Determine the number of swaps to do
        if(startIndex < destinationIndex)
            numberOfSwapsToDo = destinationIndex - startIndex;
        else if(destinationIndex < startIndex)
            numberOfSwapsToDo = startIndex - destinationIndex;
        else if(destinationIndex === startIndex)
			return;
        
        // Let's start
        doSwapping(numberOfSwapsDone, numberOfSwapsToDo, startIndex, destinationIndex);
    }
    
    // The actual function which gets the job done
    /**
     * Swaps the TaskViews.
     * @param  {Number} numberOfSwapsDone Number of swaps that have been done thus far.
     * @param  {Number} numberOfSwapsToDo Number of swaps left.
     * @param  {Number} startIndex        The TaskView's starting index.
     * @param  {Number} destinationIndex  The TaskView's destination index.
     */
    function doSwapping(numberOfSwapsDone, numberOfSwapsToDo, startIndex, destinationIndex) {
        
        console.debug(">>>> Do swapping");
        
        // The li elements of the list
        // Do it within the function so it's refreshed for every call
        var $liElements = $("ul").children();
        
        // Check if we try to push up or down an item
        var isPushingDown = startIndex < destinationIndex;
        
        // Index of the top and botto li
        var northLiIndex = startIndex + numberOfSwapsDone;
        var southLiIndex = startIndex + numberOfSwapsDone + 1;
        if(! isPushingDown) { // Pushing up
            northLiIndex = startIndex - numberOfSwapsDone - 1;
            southLiIndex = startIndex - numberOfSwapsDone;
        }
        
        // Get the JQ elements (use .eq, not get)
        var $northLi = $liElements.eq(northLiIndex);
        var $southLi = $liElements.eq(southLiIndex);
        
        
        swapLiElements($northLi, $southLi, isPushingDown, DURATION, JQUERYUI_EASING, function(){
        
            numberOfSwapsDone++;
                
            // End point of the recursive function
            if(numberOfSwapsDone >= numberOfSwapsToDo)
                return;
                
            // Recursive call
            doSwapping(numberOfSwapsDone, numberOfSwapsToDo, startIndex, destinationIndex);
        });
    }
   
   /**
    * Swaps the actual <li> items.
    * @param  {[type]}  $northLi         [description]
    * @param  {[type]}  $southLi         [description]
    * @param  {Boolean} isPushingDown    [description]
    * @param  {[type]}  duration         [description]
    * @param  {[type]}  easing           [description]
    * @param  {[type]}  callbackFunction [description]
    * @return {[type]}
    */
    function swapLiElements($northLi, $southLi, isPushingDown, duration, easing, callbackFunction) {
        
        var movement = $northLi.outerHeight();
        
        // Set the z-index of the moved item to 999 to it appears on top of the other elements
        if(isPushingDown)
            $northLi.css('z-index', '999');
        else
            $southLi.css('z-index', '999');
        
        // Move down the first li
        $northLi.animate({'top': movement}, {
            duration: duration,
            queue: false,
            easing: easing,
            complete: function() {
                // Swap the li in the DOM
                if(isPushingDown)
                    $northLi.insertAfter($southLi);
                else
                    $southLi.insertBefore($northLi);
                
                resetLiCssPosition($northLi);
                resetLiCssPosition($southLi);
                
                callbackFunction();
            }
        });
        
        $southLi.animate({'top': -movement}, {
            duration: duration,
            queue: false,
            easing: easing
        });
        
    }
    
    /**
     * Reset the position of the <li> element to the default one.
     * @param  {object} $liElement The element that needs to be reset.
     */
    function resetLiCssPosition($liElement) {
        $liElement.css({'position': 'static', 'top': '0'});
        $liElement.css('z-index', '0');
    }

    // jQuery ui sortable stuff for drag & drop functionality
	// -----------
	$('#task-list').sortable({
		start: function(e, ui){
			$(ui.placeholder).hide(100);
			// was looking to fix that index not updating properly issue here: http://stackoverflow.com/questions/4956039/jquery-sortable-change-event-element-position
			var start_pos = ui.item.index();
			ui.item.data('start_pos', start_pos);
			console.log('ui.item.index(): ' + start_pos);
		},
		stop: function(e, ui){
		},
		forcePlaceholderSize: true,
		change: function (e,ui){
			$(ui.placeholder).hide().show(100);
			// console.log('new index via the placeholder: ' + ui.placeholder.index());
			var start_pos = ui.item.data('start_pos'),
				newIndex = ui.placeholder.index();
			if(start_pos < newIndex) newIndex -= 1;
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
    $('#task-list').disableSelection();
});
