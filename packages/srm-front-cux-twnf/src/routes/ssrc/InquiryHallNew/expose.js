import { Expose } from 'utils/remote';

export default new Expose({
  process: {
    SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_ADVANCEDSEARCH_ARGUMENT_PARAMS: (sourceParams, otherProps) => {
      const { queryParams, that, mountFlag } = otherProps || {};
      const { tabStatus, rfxNum } = queryParams || {};
      if (!that?.bidFlag && mountFlag && tabStatus === 'all' && rfxNum && that?.SearchComponent?.customizeDs) {
        if (that.SearchComponent.customizeDs.current) {
          that.SearchComponent.customizeDs.current.set('multiRfxNumOrTitle', [rfxNum]);
        } else {
          that.SearchComponent.customizeDs.create({
            multiRfxNumOrTitle: [rfxNum],
          });
        };
        return {
          ...(sourceParams || {}),
          multiRfxNumOrTitle: [rfxNum],
        };
      };
      return sourceParams;
    },
  },
});