import React, { createContext, FunctionComponent, useMemo, ReactNode, useContext, useEffect, useState } from 'react';
import { useDataSet, DataSet } from 'choerodon-ui/pro';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import { isNil } from 'lodash';
import querystring from 'querystring';
import { set, get, toJS } from 'mobx';

import {
  baseInfoDS,
  bidPlanNodeDS,
  bidPlanContentDS,
} from './storeDS';

// 定义 Context 值类型
interface StoreContextValue {
  editorFlag: boolean;
  sourceProjectId?: string | number;
  commonDs?: {
    baseInfoDs: DataSet;
    bidPlanNodeDs: DataSet;
    bidPlanContentDs: DataSet;
  };
  history?: any;
  setStoreData?: (key: string, value: any) => void;
  getStoreData?: (key?: string) => any;
  storeData?: Record<string, any>;
  [key: string]: any; // 保留扩展能力
}

const StoreContext = createContext<StoreContextValue>({
  editorFlag: false,
  sourceProjectId: '',
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
      sourceProjectId?: string | number;
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
  const { pathname, search } = location;

  const { sourceProjectId } = params || {};

  // 解析 URL 查询参数（修复空字符串解析问题）
  const routerParams = search ? querystring.parse(search.substr(1)) : {};
  const { sourceFrom = null } = routerParams as Record<string, string>;

  // 基础信息
  const baseInfoDs = useDataSet(() => baseInfoDS({ sourceProjectId }), []);

  // 招标节点
  const bidPlanNodeDs = useDataSet(() => bidPlanNodeDS(), []);

  // 招标内容
  const bidPlanContentDs = useDataSet(() => bidPlanContentDS({ sourceProjectId }), []);

  const [pageLoading, setPageLoading] = useState(false);
  const bidPlanStatus = useObserver(() => baseInfoDs.current?.get('attributeVarchar13'));

  // 页面编辑标识
  const editorFlag = useMemo(() => {
    return ['NEW', 'REFUSE'].includes(bidPlanStatus) && pathname.includes('/scux/ssrc/bid-plan-workbench/bp-update');
  }, [bidPlanStatus, pathname]);

  // 明细页面
  const bidPageDetailFlag = useMemo(() => {
    return pathname.includes('/scux/ssrc/bid-plan-workbench/bp-detail');
  }, [pathname]);

  // 变更标识
  const changeFlag = useMemo(() => {
    return ['SOURCE_PREPARATION', 'CHANGE_REFUSE', 'CHANGING'].includes(bidPlanStatus) && pathname.includes('/scux/ssrc/bid-plan-workbench/bp-update');
  }, [bidPlanStatus, pathname]);

  useEffect(() => {
    initData();
  }, []);

  // 初始化数据
  const initData = () => {
    setPageLoading(true);
    Promise.all([
      baseInfoDs?.query(),
      bidPlanContentDs?.query(),
    ]).then(results => {
      if (results[0] && !results[0]?.failed) {
        bidPlanNodeDs?.loadData(results[0].bidNodeList || []);
      };
    }).finally(() => {
      setPageLoading(false);
    });
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
        baseInfoDs,
        bidPlanNodeDs,
        bidPlanContentDs,
      },
      editorFlag,
      bidPageDetailFlag,
      changeFlag,
      history,
      sourceProjectId,
      pageLoading,
      setPageLoading,
      initData,
      setStoreData: reactionStoreData.setStoreData,
      getStoreData: reactionStoreData.getStoreData,
      storeData: toJS(reactionStoreData.storeData), // 转为普通对象，避免代理对象导致的语法问题
    }),
    [
      baseInfoDs,
      bidPlanNodeDs,
      bidPlanContentDs,
      editorFlag,
      bidPageDetailFlag,
      changeFlag,
      history,
      sourceProjectId,
      pageLoading,
      setPageLoading,
      initData,
      reactionStoreData.setStoreData,
      reactionStoreData.getStoreData,
      reactionStoreData.storeData,
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
