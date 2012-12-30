var taskData = [{
    "title": "lulz",
    "displayTime": "0:00:00",
    "order": 1,
    "sessions": [{
        "totalTime": 176,
        "startDate": 1355937689562,
        "endDate": 1.7976931348623157e+308,
        "timerInterval": 15
    }, {
        "totalTime": 41,
        "startDate": 1355938040982,
        "endDate": 1.7976931348623157e+308,
        "timerInterval": 66
    }, {
        "totalTime": 25,
        "startDate": 1355938229063,
        "endDate": 1.7976931348623157e+308,
        "timerInterval": 116
    }, {
        "totalTime": 1,
        "startDate": 1356717115748,
        "endDate": 1356717117390,
        "timerInterval": 45
    }],
    "totalTime": 243,
    "isRecording": false,
    "id": "462b23b4-6314-ceb3-6a79-51b8ca90bff9",
    "justStopped": false,
    "currentSession": {
        "totalTime": 1,
        "startDate": 1356717115748,
        "endDate": 1356717117390,
        "timerInterval": 45
    }
}, {
    "title": "deux",
    "displayTime": "0:00:00",
    "order": 0,
    "sessions": [{
        "totalTime": 159,
        "startDate": 1355937868393,
        "endDate": 1.7976931348623157e+308,
        "timerInterval": 31
    }, {
        "totalTime": 29,
        "startDate": 1355938195008,
        "endDate": 1.7976931348623157e+308,
        "timerInterval": 98
    }, {
        "totalTime": 109,
        "startDate": 1355938258240,
        "endDate": 1.7976931348623157e+308,
        "timerInterval": 137
    }],
    "totalTime": 297,
    "isRecording": false,
    "id": "b218c347-eb0a-1be1-cdb8-0cf7dfa99a48",
    "justStopped": false,
    "currentSession": {
        "totalTime": 109,
        "startDate": 1355938258240,
        "endDate": 1.7976931348623157e+308,
        "timerInterval": 137
    }
}];

describe('Task', function() {

    beforeEach(function() {
        this.taskModel = new Task(taskData[0]);
    });

    it('should be able to start a Session', function() {
		this.taskModel.startSession();
		expect(this.taskModel.get('currentSession')).toBeTruthy();
    });

});