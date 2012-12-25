## 10k documentation

10k is built on sinatra and backbonejs. 

### Models  

**Tasks** contain **Sessions** which are created by users whenever they want to log activity on a particular Task.

```json
[ Task: {  
            id: 293819,
            title: "Task title",  
            displayTime: '0:00:00',
            order: 0,
            totalSeconds: 0,
            creationDate: new Date(),
            sessions: [
                Session: {
                            startDate: new Date(),
                            endDate: new Date()
                        },
                Session: {
                            etc...
                        }
            ],
            tags: [
                "family",
                "entertainment",
                "work"
            ]
}]
```

**Tags**

```json
[ Tag: {
            id: 23,
            name: "health"   
}]
```