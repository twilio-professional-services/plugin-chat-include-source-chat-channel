import { Manager } from '@twilio/flex-ui';


const ACTION_INIT_TASKS = "INIT_TASKS"; 
const ACTION_REGISTER_TASK = "REGISTER_TASK"; 
const ACTION_SET_SOURCE_NOTIFICATION_CLOSED = "SET_SOURCE_NOTIFICATION_CLOSED"; 

const initialTaskState = {
  taskSid: undefined,
  sourceChatChannelSid: undefined,
  isSourceChannelNotificationClosed: false
}

const initialState = {
  tasks: [],
};

// Define plugin actions
export class Actions {
  static initTasks = () => ({
    type: ACTION_INIT_TASKS
  });
  static registerTask = (task) => ({
    type: ACTION_REGISTER_TASK,
    task,
  });
  static setSourceNotificationClosed = (taskSid) => ({
    type: ACTION_SET_SOURCE_NOTIFICATION_CLOSED,
    taskSid
  });  

}

// Define how actions influence state
export function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_INIT_TASKS: {

      // Get all the worker tasks, iterate, and make sure they get default state set
      const taskStates = [];
      Manager.getInstance().workerClient.reservations.forEach((reservation) => {
        // Initialize and default to notification already being closed for existing in-flight tasks (e.g. if page is refreshed)
        // (bit of an assumption, but better than re-displaying for all tasks; localStorage could be a more persistent approach)
        const taskState = {
          ...initialTaskState,
          taskSid : reservation.task.sid,
          sourceChatChannelSid : reservation.task.attributes.sourceChatChannelSid,
          isSourceChannelNotificationClosed : true
        };
        taskStates.push(taskState);
      });
      return {
        ...state,
        tasks: taskStates
      };
    }
    case ACTION_REGISTER_TASK: {
      const { task } = action;

      const taskState = {
        ...initialTaskState,
        taskSid : task.taskSid,
        sourceChatChannelSid : task.attributes.sourceChatChannelSid,
      };

      const copyOfTasks = [...state.tasks];
      copyOfTasks.push(taskState);
      return {
        ...state,
        tasks: copyOfTasks
      };
 
    }
    case ACTION_SET_SOURCE_NOTIFICATION_CLOSED: {
      const taskSid = action.taskSid;

      return {
        ...state,
        tasks: state.tasks.map((task) => {
          // Update the matching queue
          if (task.taskSid === taskSid) {
            return {
              ...task,
              isSourceChannelNotificationClosed: true
            }
          }
          // Non matching queues left untouched
          return task;
        })
      };    
    }
    default:
      return state;
  }
};
