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
			startTime: new Date(),
			totalTime: 0
		},
		
		// can't really think of anything to initialize
		initialize: function() {

		},
		
		// starts a new task recording session
		start: function() {
			// fire off event ever second to run timer
			this.timerInterval = setInterval(function(){
				// some stuff we should do every second 	

			}, 1000);
		}, 
		
		// stops or pauses a current recording session 
		stop: function() {
			clearInterval(this.timerInterval);
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
				
		},

		// when start is called, add a new session to the sessions array and then call play() on it
		start: function() {
			this.sessions.push(new Session());
			// stores index of current session 
			this.sessionIndex = sessions.length - 1;
			this.sessions[this.sessionIndex].start();
		},
		
		// stops the current session 
		stop: function() {
			this.sessions[this.sessionIndex].stop();	
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
		}
	});

	var Tasks = new TaskList;
});
