import React, { createContext, FunctionComponent, useMemo, ReactNode, useContext, useEffect, useState } from 'react';
import { useDataSet, DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { isNil } from 'lodash';
import { set, get, toJS } from 'mobx';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { headerDataSet, supplierListDataSet, sectionListDataSet, isRatingEnabled } from './storeDS';
import { queryPreWinningBid } from '../api';

const prefix = 'scux.preWinningBid';

interface StoreContextValue {
  rfxHeaderId?: string;
  commonDs?: {
    headerDs: DataSet;
    supplierListDs: DataSet;
    sectionListDs: DataSet;
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

  // 通威二开 - 标段列表，数据取自 queryPreWinningBid 返回的 sectionList
  const sectionListDs = useDataSet(() => sectionListDataSet(), []);

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
    // 通威二开 - 这里原来读的是 'attachmentTableRef'，但整个页面写入的 key 是
    // 'fileTemplateAttachmentRef'（见 SupplierList 的 onRef），读的 key 从未被写过，
    // 导致 getStoreData 恒为 undefined、这个函数是空转的死代码：附件表格从首次加载后就再没刷新过。
    // 后果是保存后 header/supplierList/sectionList 都换了新版本号，唯独 attachmentLineList
    // 还停在旧版本，第二次保存被后端乐观锁拒掉，报「数据已过时」。
    const { lineDS } = reactionStoreData.getStoreData('fileTemplateAttachmentRef') || {};
    if (lineDS) {
      // 必须 await 到查询结束：否则保存流程已结束、按钮已解锁，附件行却还是保存前的旧版本号，
      // 第二次保存照样会被乐观锁拒掉。commons 等查询参数在首次 initPage 时已设好且不变，直接查即可。
      await lineDS.query(lineDS.currentPage || 1);
    }
  };

  const initData = async () => {
    setPageLoading(true);
    try {
      const res = await queryPreWinningBid({ rfxHeaderId });
      if (getResponse(res)) {
        const { rfxHeader = {}, supplierList = [], sectionList = [] } = res;
        headerDs.loadData([rfxHeader]);
        // 通威二开 - 未启用评标时才启用「最终价同步 + 附件上传」（见 getFinalPriceSyncFields）：
        // 「供应商列表」tab 的最终价可编辑，附件列出现，且最终价有值时附件必填
        supplierListDs.setState('finalPriceSync', !isRatingEnabled(rfxHeader?.templateScoreType));
        supplierListDs.loadData(supplierList);
        supplierListDs.setState('headerDs', headerDs);
        sectionListDs.loadData(sectionList);
      };
      await fetchAttachmentList();
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
        sectionListDs,
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
      sectionListDs,
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
