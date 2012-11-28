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
	
	// Session Model
	// --------------
	var Session = Backbone.Model.extend({
		
		// defaults for a session
		defaults: function() {
			// sessions are only created when the start function is called and they are added to the sessions array, hmm but what about pause/play functionality?
		},
		
		// can't really think of anything to initialize
		initialize: function() {
			this.set({'totalTime' : 0});
		},
		
		// starts a new task recording session
		startSession: function() {
			// fire off event ever second to run timer
			var seconds = 0;
			this.set({'timerInterval' : setInterval(function(){
				// some stuff we should do every second 	
				seconds += 1;
				var stringToPrint = (new Date).clearTime().addSeconds(seconds).toString('H:mm:ss');
				console.log(stringToPrint);
			}, 1000)});
		}, 
		
		// stops or pauses a current recording session 
		stopSession: function() {
			clearInterval(this.get('timerInterval'));
			// console.log('session should be stopped');
		}
	});

	// Task Model
	// -----------
	var Task = Backbone.Model.extend({
		
		// defaults set for a task
		defaults: function() {
			return {
				title: "default value",
				order: Tasks.nextOrder(),
				sessions: new Array()
			};
		},

		// initialize 
		initialize: function() {
			this.set({'sessions' : this.defaults().sessions});
			this.set({'isRecording' : false});
		},

		// when start is called, add a new session to the sessions array and then call play() on it
		startSession: function() {
			var sessions = this.get('sessions');
			sessions.push(new Session());
			// stores index of current session 
			var sessionIndex = sessions.length - 1;
			sessions[sessionIndex].startSession();
			this.set({'isRecording' : true});
		},
		
		// stops the current session 
		stopSession: function() {
			// should probably add a check to see if the current session is actually running
			var sessions = this.get('sessions');
			sessions[sessions.length - 1].stopSession();	
			this.set({'isRecording' : false});
		},

		// returns total time of all sesssions stored in task
		getTotalTime: function() {
			// loop through sessions and get sum of the total time spent on the task	
			var i;
			var sum = 0;
			for(i = 0; i <= this.sessionIndex - 1; i++) {
				sum += this.sessions[i].getTotalTime();
			}
			return sum;
		}
	});

	// Tasks Collection
	// ----------------
	
	var TaskList = Backbone.Collection.extend({
		model: Task,

		localStorage: new Backbone.LocalStorage("tasks-backbone"),

		nextOrder: function() {
			if (!this.length) return 1;
			return this.last().get('order') + 1;
		},
		
		comparator: function(task) {
			return task.get('order');
		},

		// keeps track of the presence of an active session
		logStartSession: function(task) {
			this.activeSession = task;
		},

		// logs the stopping of an active session, in other words setting it to null
		logStopSession: function() {
			this.activeSession = null;
		},

		// this function will stop the active session if one exists
		stopActiveSession: function() {
			if(this.activeSession) this.activeSession.stopSession();
		}
	});

	var Tasks = new TaskList;

	// Task Item View
	// --------------

	var TaskView = Backbone.View.extend({
		
		tagName: "li",

		// cache the template function for a single item 
		template: _.template($('#item-template').html()),

		// events to listen to
		events: {
			'click #start-button' : 'startSession',
			'click #stop-button' : 'stopSession'
		},

		//init
		initialize: function() {
			this.model.on('change', this.render, this);
		},

		// re render titles of the task item
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		startSession: function() {
			// if there is a current session running, we need to stop it
			Tasks.stopActiveSession();
			Tasks.logStartSession(this.model);
			this.model.startSession();	
		},

		stopSession: function() {
			if(this.model.get('isRecording') === true) {			
				Tasks.logStopSession();
				this.model.stopSession();
			}
		},

		// close and save values to the model
		close: function() {
			
		},

		updateOnEnter: function(e) {
			if (e.keyCode == 13) this.close();
		},

		// remove the item and then destroy the model
		clear: function() {
			this.model.destroy();
		}
	});

	// Application
	// -----------
	
	var AppView = Backbone.View.extend({
		
		el: $('#10khoursapp'),

		initialize: function() {
			
			this.input = this.$('#new-task');

			Tasks.on('add', this.addOne, this);
			Tasks.on('reset', this.addAll, this);

			Tasks.fetch();
		},

		render: function() {
		},

		events: {
			'keypress #new-task': 'createOnEnter'
		},

		addOne: function(task) {
			var view = new TaskView({model : task});
			this.$('#task-list').append(view.render().el);
		},

		addAll: function() {
			Tasks.each(this.addOne);
		},

		createOnEnter: function(e) {
			if (e.keyCode != 13) return;
			if (!this.input.val()) return;

			Tasks.create({title: this.input.val()});
			this.input.val('');
		}
	});
	
	// create the app
	var App = new AppView;
});
