import React, { createContext, FunctionComponent, useMemo, ReactNode, useContext, useEffect, useState } from 'react';
import { useDataSet, DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { isNil } from 'lodash';
import { set, get, toJS } from 'mobx';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { headerDataSet, supplierListDataSet } from './storeDS';
import { queryPreWinningBid } from '../api';

const prefix = 'scux.preWinningBid';

interface StoreContextValue {
  rfxHeaderId?: string;
  commonDs?: {
    headerDs: DataSet;
    supplierListDs: DataSet;
  };
  history?: any;
  setStoreData?: (key: string, value: any) => void;
  getStoreData?: (key?: string) => any;
  pageLoading: boolean;
  setPageLoading?: (loading: boolean) => void;
  initData?: () => void;
  storeData?: {[key: string]: any};
  prefix: string;
  customizeTable?: any;
  customizeBtnGroup?: any;
  [key: string]: any;
}

const StoreContext = createContext<StoreContextValue>({
  rfxHeaderId: '',
  pageLoading: false,
  prefix,
});

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

interface StoreProviderProps {
  match?: {
    params: {
      rfxHeaderId?: string;
    };
  };
  children: ReactNode;
  location?: {
    pathname: string;
    search: string;
  };
  history?: any;
  [key: string]: any;
}

const StoreProvider: FunctionComponent<StoreProviderProps> = (props) => {
  const {
    match = { params: {} },
    children,
    history,
    customizeTable,
    customizeBtnGroup,
  } = props;

  const { params } = match;
  const { rfxHeaderId = '' } = params || {};

  const [pageLoading, setPageLoading] = useState(false);

  const headerDs = useDataSet(() => headerDataSet({ rfxHeaderId }), [rfxHeaderId]);

  const supplierListDs = useDataSet(() => supplierListDataSet({ rfxHeaderId }), [rfxHeaderId]);

  useEffect(() => {
    initData();
  }, []);

  const reactionStoreData = useLocalStore(() => ({
    storeData: {},
    setStoreData: (key: string, value: any) => {
      set(reactionStoreData.storeData, key, value);
    },
    getStoreData: (key?: string) => {
      return isNil(key) ? toJS(reactionStoreData.storeData) : get(reactionStoreData.storeData, key);
    },
  }));

  // 查询附件列表
  const fetchAttachmentList = async () => {
    const { lineDS } = reactionStoreData.getStoreData('attachmentTableRef') || {};
    if (lineDS) {
      const { currentPage } = lineDS || {};
      lineDS.query(currentPage || 1);
    }
  };

  const initData = async () => {
    setPageLoading(true);
    try {
      const res = await queryPreWinningBid({ rfxHeaderId });
      if (getResponse(res)) {
        const { rfxHeader = {}, supplierList = [] } = res;
        headerDs.loadData([rfxHeader]);
        supplierListDs.loadData(supplierList);
        supplierListDs.setState('headerDs', headerDs);
      };
      fetchAttachmentList();
      setPageLoading(false);
    } catch (error) {
      setPageLoading(false);
      throw error;
    }
  };

  const storeData = useMemo(
    () => ({
      commonDs: {
        headerDs,
        supplierListDs,
      },
      history,
      rfxHeaderId: rfxHeaderId || '',
      pageLoading,
      setPageLoading,
      initData,
      setStoreData: reactionStoreData.setStoreData,
      getStoreData: reactionStoreData.getStoreData,
      storeData: toJS(reactionStoreData.storeData),
      prefix,
      customizeTable,
      customizeBtnGroup,
    }),
    [
      headerDs,
      supplierListDs,
      history,
      rfxHeaderId,
      pageLoading,
      setPageLoading,
      initData,
      reactionStoreData.setStoreData,
      reactionStoreData.getStoreData,
      reactionStoreData.storeData,
      prefix,
      customizeTable,
      customizeBtnGroup,
    ]
  );

  return (
    <StoreContext.Provider value={storeData}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
export { StoreContext };
