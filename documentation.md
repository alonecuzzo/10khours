## 10k documentation

10k is built on sinatra and backbonejs. 

### Models  

Tasks contain Sessions which are created by users whenever they want to log activity on a particular Task.

```json
[ Task: {  
            name: "Task Name",  
            sessions: [
                Session: {

                        },
                Session: {

                    }],
}]
```