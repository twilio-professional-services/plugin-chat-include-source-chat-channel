import React from 'react';
import { connect } from 'react-redux';

import { Actions as FlexActions, Manager } from '@twilio/flex-ui';
import { SourceChatChannelNotificationStyles } from './SourceChatChannelNotification.Styles';
import { Actions } from '../state/SourceChatChannelState';
import { namespace } from '../state';


class SourceChatChannelNotification extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {  
    if (!this.getTaskState()?.isSourceChannelNotificationClosed) {
      return (
        <SourceChatChannelNotificationStyles>
          Automated system history exists.&nbsp;
          <i className="accented" onClick={() => this.openHistoryTab()}>Click here</i> to view.
          <i className="accented right" onClick={() => this.closeNotification()}>
            close
          </i>
        </SourceChatChannelNotificationStyles>
      );
    } else {
      // State says this notification was already closed, so don't re-render
      return null;
    }
  }

  openHistoryTab() {
    FlexActions.invokeAction("SetComponentState", { 
      name: "AgentTaskCanvasTabs", 
      state: { selectedTabName: "source-chat" } 
    });
    this.closeNotification();  
  }

  closeNotification() {
    Manager.getInstance().store.dispatch(Actions.setSourceNotificationClosed(this.props.task.taskSid));
  }

  getTaskState() {
    const taskState = this.props.taskStates.find((taskState) => taskState.taskSid === this.props.task.taskSid);
    return taskState;
  }
}



const mapStateToProps = (state) => {
  const customReduxStore = state?.[namespace];

  return {
    taskStates: customReduxStore?.sourceChatChannel.tasks
  }
}

export default connect(mapStateToProps)(SourceChatChannelNotification);
