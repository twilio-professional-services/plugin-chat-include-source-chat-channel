import { combineReducers } from 'redux';
import { reduce as sourceChatChannelReducer } from './SourceChatChannelState';


// Register your redux store under a unique namespace
export const namespace = 'flex-chat-source-chat-channel';

// Combine the reducers
export default combineReducers({
  sourceChatChannel: sourceChatChannelReducer
});