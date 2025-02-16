import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WebSocketState, WebSocketMessage } from '../../types/websocket.types';

const initialState: WebSocketState = {
  connected: false,
  reconnectAttempts: 0,
  subscriptions: [],
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    connectionEstablished(state) {
      state.connected = true;
      state.reconnectAttempts = 0;
    },
    connectionLost(state) {
      state.connected = false;
    },
    reconnectAttempted(state) {
      state.reconnectAttempts += 1;
    },
    subscriptionAdded(state, action: PayloadAction<string>) {
      if (!state.subscriptions.includes(action.payload)) {
        state.subscriptions.push(action.payload);
      }
    },
    subscriptionRemoved(state, action: PayloadAction<string>) {
      state.subscriptions = state.subscriptions.filter(
        sub => sub !== action.payload
      );
    },
    pingReceived(state) {
      state.lastPing = Date.now();
    },
    reset(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  connectionEstablished,
  connectionLost,
  reconnectAttempted,
  subscriptionAdded,
  subscriptionRemoved,
  pingReceived,
  reset,
} = websocketSlice.actions;

export default websocketSlice.reducer; 