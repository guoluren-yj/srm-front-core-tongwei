export default {
  namespace: 'mouldAccount',
  state: {
    activeKey: 'normal',
    tableStatus: 'header',
  },

  effects: {},
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
