/*
 * Copyright The OpenZipkin Authors
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable no-param-reassign */

import {
  SerializedError,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import * as api from '../constants/api';
import Dependencies from '../models/Dependencies';
import Distrace from "../models/Distrace";

export const loadDistrace = createAsyncThunk(
  'distrace/fetch',
  async (params: { lookback?: number; endTs: number }) => {
    const ps = new URLSearchParams();
    if (params.lookback) {
      ps.set('lookback', params.lookback.toString());
    }
    ps.set('endTs', params.endTs.toString());

    const resp = await fetch(`${api.DISTRACE}?${ps.toString()}`);
    if (!resp.ok) {
      throw Error(resp.statusText);
    }
    const json = await resp.json();
    return json as Distrace;
  },
);

export interface DistraceState {
  isLoading: boolean;
  distraces: Distrace;
  error?: SerializedError;
}

const initialState: DistraceState = {
  isLoading: false,
  distraces: [],
  error: undefined,
};

const distracesSlice = createSlice({
  name: 'distrace',
  initialState,
  reducers: {
    clearDistrace: (state) => {
      state.isLoading = false;
      state.distraces = [];
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadDistrace.pending, (state) => {
      state.isLoading = true;
      state.distraces = [];
      state.error = undefined;
    });
    builder.addCase(loadDistrace.fulfilled, (state, action) => {
      state.isLoading = false;
      state.distraces = action.payload;
      state.error = undefined;
    });
    builder.addCase(loadDistrace.rejected, (state, action) => {
      state.isLoading = false;
      state.distraces = [];
      state.error = action.error;
    });
  },
});

export const { clearDistrace } = distracesSlice.actions;

export default distracesSlice;
