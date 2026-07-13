import React, { createContext, FunctionComponent, useMemo, ReactNode, useContext, useEffect, useState } from 'react';
import { useDataSet, DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { isNil } from 'lodash';
import { set, get, toJS } from 'mobx';

import intl from 'utils/intl';

import {
  evaluationHeaderDataSet,
  evaluationExpertDataSet,
  supplierListDataSet,
  bidOpeningListDataSet,
} from './storeDS';

const prefix = 'scux.bidEvaluationManagement';

// 定义 Context 值类型
interface StoreContextValue {
  editorFlag: boolean;
  rfxHeaderId?: string | number;
  commonDs?: {
    evaluationHeaderDs: DataSet;
    evaluationExpertDs: DataSet;
    evaluationSupplierDs: DataSet;
    bidOpeningListDs: DataSet;
  };
  history?: any;
  setStoreData?: (key: string, value: any) => void;
  getStoreData?: (key?: string) => any;
  pageType: string;
  storeData?: Record<string, any>;
  [key: string]: any; // 保留扩展能力
}

const StoreContext = createContext<StoreContextValue>({
  editorFlag: false,
  rfxHeaderId: '',
  pageType: '', // tech 技术评标、price 价格评标、summary 评标汇总
});

// 封装自定义 Hook（推荐），简化子组件使用，同时做非空校验
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
      rfxHeaderId?: string | number;
      pageType?: string;
    };
  };
  children: ReactNode;
  location?: {
    pathname: string;
    search: string;
  };
  history?: any;
  [key: string]: any;
};

const StoreProvider: FunctionComponent<StoreProviderProps> = (props) => {
  const {
    match = { params: {} },
    children,
    location = { pathname: '', search: '' },
    history,
  } = props;

  const { params } = match;
  const { search } = location;

  const { rfxHeaderId, pageType } = params || {};

  // 解析 URL 查询参数
  // const routerParams = search ? querystring.parse(search.substr(1)) : {};

  // 评标头信息
  const evaluationHeaderDs = useDataSet(() => evaluationHeaderDataSet({ rfxHeaderId }), [rfxHeaderId]);

  // 评标汇总 - 开标列表
  const bidOpeningListDs = useDataSet(() => bidOpeningListDataSet(), []);

  // 评标汇总 - 专家列表
  const evaluationExpertDs = useDataSet(() => evaluationExpertDataSet(), []);

  // 评标汇总 - 供应商列表
  const evaluationSupplierDs = useDataSet(() => supplierListDataSet(), []);

  const [pageLoading, setPageLoading] = useState(false);

  // 页面编辑标识
  const editorFlag = useMemo(() => {
    // 根据实际业务逻辑判断编辑状态
    return pageType === 'update';
  }, [pageType]);

  useEffect(() => {
    initData();
  }, []);

  // 初始化数据
  const initData = async () => {
    setPageLoading(true);
    try {
      const headerRes = await evaluationHeaderDs.query();
      if (headerRes) {
        const { bidOpenList, expertList, supplierList } = headerRes;
        evaluationExpertDs.loadData(expertList || []);
        evaluationSupplierDs.loadData(supplierList || []);
        bidOpeningListDs.loadData(bidOpenList || []);
      };
      setPageLoading(false);
    } catch (error) {
      setPageLoading(false);
      throw error;
    };
  };

  const reactionStoreData = useLocalStore(() => ({
    storeData: {} as Record<string, any>,
    setStoreData: (key: string, value: any) => {
      set(reactionStoreData.storeData, key, value);
    },
    getStoreData: (key?: string) => {
      return isNil(key) ? toJS(reactionStoreData.storeData) : get(reactionStoreData.storeData, key);
    },
  }));

  // 整合 storeData
  const storeData = useMemo(
    () => ({
      commonDs: {
        evaluationHeaderDs,
        evaluationExpertDs,
        evaluationSupplierDs,
        bidOpeningListDs,
      },
      editorFlag,
      history,
      rfxHeaderId,
      pageLoading,
      setPageLoading,
      initData,
      pageType: pageType || '',
      setStoreData: reactionStoreData.setStoreData,
      getStoreData: reactionStoreData.getStoreData,
      storeData: toJS(reactionStoreData.storeData), // 转为普通对象，避免代理对象导致的语法问题
      prefix,
    }),
    [
      evaluationHeaderDs,
      evaluationExpertDs,
      evaluationSupplierDs,
      bidOpeningListDs,
      editorFlag,
      history,
      rfxHeaderId,
      pageLoading,
      setPageLoading,
      initData,
      pageType,
      reactionStoreData.setStoreData,
      reactionStoreData.getStoreData,
      reactionStoreData.storeData,
      prefix,
    ]
  );

  // 仅传递必要的 storeData，而非合并所有 props（避免冗余）
  return (
    <StoreContext.Provider value={storeData}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
export { StoreContext };
