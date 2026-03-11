import { configureStore } from '@reduxjs/toolkit';
import allianceReducer from '../features/alliance/model/allianceSlice';

export const store = configureStore({
  reducer: {
    alliance: allianceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
