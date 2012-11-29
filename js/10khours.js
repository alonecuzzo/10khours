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

	// Task Model
	// -----------
	Task = Backbone.Model.extend({
		// defaults set for a task
		defaults: function() {
			return {
				title: 'default value',
				displayTime: '0:00:00',
				order: Tasks.nextOrder(),
				sessions: new Array(),
				totalTime: 0 
			};
		},

		initialize: function() {
			this.set({'isRecording' : false});
			this.set('displayTime', '0:00:00');
			this.set('totalTime', this.getTotalTime());
		},

		updateDisplayTime: function(stringToPrint) {
			this.set('displayTime', stringToPrint);
			this.set('totalTime', this.getTotalTime());
			this.save();
		},

		// when start is called, add a new session to the sessions array and then call play() on it
		startSession: function() {
			this.set({'isRecording' : true});
			this.set('displayTime', '0:00:00');
			var sessions = this.get('sessions');
			var self = this;
			// instead of keeping a session model, let's just create a session object and keep it in an array
			var session = {
				
				totalTime: 0,

				timerInterval: null,

				startSession: function() {
					var seconds = 0;
					var instance = this;
					this.timerInterval = setInterval(function(){
						seconds += 1;
						instance.totalTime = seconds;
						var stringToPrint = (new Date).clearTime().addSeconds(seconds).toString('H:mm:ss');
						self.updateDisplayTime(stringToPrint);
						console.log(stringToPrint);
					}, 1000);
				},

				stopSession: function() {
					clearInterval(this.timerInterval);
				}
			};
			this.set('currentSession', session);
			session.startSession();
			sessions.push(session);
		},
		
		// stops the current session 
		stopSession: function() {
			var	currentSession = this.get('currentSession');
			currentSession.stopSession();
			this.set({'isRecording' : false});
			this.save();
			this.set('displayTime', '0:00:00');

			console.log('total time for this activity: ' + this.getTotalTime());
		},

		// returns total time of all sesssions stored in task
		getTotalTime: function() {
			var i;
			var sum = 0;
			var sessions = this.get('sessions');
			var sessionsLen = sessions.length;
			for(i = 0; i <= sessionsLen - 1; i++) {
				sum += parseInt(sessions[i].totalTime);
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
