import React from "react";

import { FlexPlugin } from "flex-plugin";
import { Tab, TaskHelper } from "@twilio/flex-ui";
import SourceChatChannelCanvas from "./components/SourceChatChannelCanvas";
import SourceChatChannelNotification from "./components/SourceChatChannelNotification";
import reducers, { namespace } from "./state";
import { Actions } from './state/SourceChatChannelState';


const PLUGIN_NAME = "FlexChatIncludeSourceChannelPlugin";

export default class FlexChatIncludeSourceChannelPlugin extends FlexPlugin {
  
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {

    this.registerReducers(manager);

    if (manager.workerClient.reservations.size > 0 && this.getTaskStates(manager).length == 0) {
      // No custom task state in our Redux store, but tasks do exist for worker (e.g. after a reload), so initialize 
      // custom task state for these
      manager.store.dispatch(Actions.initTasks());
    }



    // Log new task to our Redux store just before accepting, so we can maintain state (e.g. whether agent has closed the 
    // notification or not)
    flex.Actions.addListener("beforeAcceptTask", (payload) => {
      const { task } = payload;
      if (task && TaskHelper.isChatBasedTask(task) && task.attributes.sourceChatChannelSid) {
        manager.store.dispatch(Actions.registerTask(task));
      }
    });
    
    // Render the notification to guide agent towards the "History" tab
    // (State-driven persistence of the notification across renders, is handled within the component)
    flex.TaskCanvas.Content.add(
      <SourceChatChannelNotification 
        key="sourceChatChannelNotification" />, 
        { 
          sortOrder: -1,
          if: (props) => 
            TaskHelper.isChatBasedTask(props.task) && 
            props.task.attributes.sourceChatChannelSid  
        });
 
    // Add the "History" tab
    flex.TaskCanvasTabs.Content.add(
      <Tab  
        key="source-chat"
        uniqueName="source-chat"
        label="History" 
        hidden={false}> 
          <SourceChatChannelCanvas />
      </Tab>, 
      {
        sortOrder: 3,
        if: (props) => TaskHelper.isChatBasedTask(props.task) && props.task.attributes.sourceChatChannelSid
      }
    );

    // Remove the "Info" tab (optional)
    //flex.TaskCanvasTabs.Content.remove("info");


  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
   registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(
        `You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`
      );
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
  
  getTaskStates(manager) {
    let taskStates = manager.store.getState()?.[namespace].sourceChatChannel.tasks;
    if (!taskStates) {
      taskStates = [];
    }
    return taskStates;
  }
}
