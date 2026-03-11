import { configureStore } from '@reduxjs/toolkit';
import allianceReducer from '../features/alliance/model/allianceSlice';
import cityReducer from '../features/city/model/citySlice';

export const store = configureStore({
  reducer: {
    alliance: allianceReducer,
    city: cityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
