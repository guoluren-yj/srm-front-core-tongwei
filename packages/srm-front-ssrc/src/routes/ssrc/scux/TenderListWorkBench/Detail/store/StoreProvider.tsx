import React, { createContext, FunctionComponent, useMemo, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { useDataSet, DataSet } from 'choerodon-ui/pro';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import { isNil } from 'lodash';
import querystring from 'querystring';
import { set, get, toJS } from 'mobx';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import request from 'utils/request';

import {
  baseInfoDS,
  tenderListSectionDS,
  bidPlanContentDS,
} from './storeDS';

// 定义 Context 值类型
interface StoreContextValue {
  editorFlag: boolean;
  bidCatalogId: string | number;
  sourceProjectId: string | number;
  commonDs?: {
    baseInfoDs: DataSet;
    tenderListSectionDs: DataSet;
    bidPlanContentDs: DataSet;
  };
  history?: any;
  setStoreData?: (key: string, value: any) => void;
  getStoreData?: (key?: string) => any;
  storeData?: { [key: string]: any };
  [key: string]: any; // 保留扩展能力
}

const StoreContext = createContext<StoreContextValue>({
  editorFlag: false,
  bidCatalogId: '',
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
      bidCatalogId: string | number;
      sourceProjectId: string | number;
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
    // 修复：默认值补充完整字段，避免 TS 推断为空对象
    match = { params: { bidCatalogId: '' } },
    children,
    location = { pathname: '', search: '' },
    history,
  } = props;

  const { params } = match;
  const { pathname, search } = location;

  const { bidCatalogId } = params;

 // 解析 URL
  const routerParams = search ? querystring.parse(search.substr(1)) : {};
  const rawSourceProjectId = routerParams.sourceProjectId;
  // 使用逻辑判断兼容 JS 解析器，确保类型为 string
  const sourceProjectId = Array.isArray(rawSourceProjectId)
    ? rawSourceProjectId[0]
    : (rawSourceProjectId || '');
  const rawBidCatalogHistoryId = routerParams.bidCatalogHistoryId;
  const bidCatalogHistoryId = Array.isArray(rawBidCatalogHistoryId)
    ? rawBidCatalogHistoryId[0]
    : (rawBidCatalogHistoryId || '');
  const rawBidVersion = routerParams.bidVersion;
  const bidVersion = Array.isArray(rawBidVersion)
    ? rawBidVersion[0]
    : (rawBidVersion || '');

  const [pageLoading, setPageLoading] = useState(false);
  // 基础信息
  const baseInfoDs = useDataSet(() => baseInfoDS({ bidCatalogId }), [bidCatalogId]);

  const catalogStatus = useObserver(() => baseInfoDs.current?.get('catalogStatus'));
  // 页面编辑标识：版本查看时不可编辑
  const editorFlag = useMemo(() => {
    return !bidCatalogHistoryId
      && ['NEW', 'APPROVED', 'CHANGING', 'SOURCE_CHANGING'].includes(catalogStatus)
      && pathname.includes('/scux/ssrc/tender-workbench/update');
  }, [catalogStatus, pathname, bidCatalogHistoryId]);

  // 招标清单标段列表ds
  const tenderListSectionDs = useDataSet(() => tenderListSectionDS({ bidCatalogId, baseInfoDs }), [bidCatalogId, baseInfoDs]);

  // 招标内容
  const bidPlanContentDs = useDataSet(() => bidPlanContentDS({ sourceProjectId }), []);

  // bid明细页面
  const bidPageDetailFlag = useMemo(() => {
    return pathname.includes('/scux/ssrc/technical-documents-workbench/tech-detail');
  }, [pathname]);

  // 初始化数据
  const initData = useCallback(async (historyId = bidCatalogHistoryId, version = bidVersion) => {
    setPageLoading(true);
    try {
      // 头信息手动请求并加载，确保版本查看时必然请求 HEADER_HISTORY
      const headerRes = getResponse(
        await request(
          `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LMuS2jN0vaD10XhDTcdxVA8TiahDph05Jw6ZvrFaHxk0u`,
          {
            method: 'GET',
            query: {
              queryType: historyId ? 'HEADER_HISTORY' : 'HEADER',
              bidCatalogId,
              ...(historyId
                ? { bidCatalogHistoryId: historyId, asyncCountFlag: 'DEFAULT', bidVersion: version }
                : {}),
            },
          }
        )
      );
      if (baseInfoDs) {
        baseInfoDs.loadData(headerRes ? [headerRes] : []);
      }

      // 标段列表
      if (tenderListSectionDs) {
        tenderListSectionDs.setQueryParameter('bidCatalogHistoryId', historyId);
        await tenderListSectionDs.query();
      }
    } finally {
      setPageLoading(false);
    }
  }, [baseInfoDs, tenderListSectionDs, bidCatalogId, bidCatalogHistoryId, bidVersion]);

  useEffect(() => {
    initData();
    const unlisten = history?.listen(() => {
      // 兜底：非重建场景下从最新 location 解析版本参数
      const currentSearch = history.location.search
        ? querystring.parse(history.location.search.substr(1))
        : {};
      const raw = currentSearch.bidCatalogHistoryId;
      const newHistoryId = Array.isArray(raw) ? raw[0] : (raw || '');
      const rawVersion = currentSearch.bidVersion;
      const newVersion = Array.isArray(rawVersion) ? rawVersion[0] : (rawVersion || '');
      initData(newHistoryId, newVersion);
    });
    return () => {
      if (unlisten) unlisten();
    };
  }, [initData, history]);

  useEffect(() => {
    // 只读页面无需显示勾选框
    if (!editorFlag && tenderListSectionDs) {
      tenderListSectionDs.selection = false;
    };
    if (editorFlag && tenderListSectionDs) {
      tenderListSectionDs.selection = DataSetSelection.multiple;
    };
  }, [editorFlag]);

  const reactionStoreData = useLocalStore(() => ({
    storeData: {},
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
        tenderListSectionDs,
        bidPlanContentDs,
      },
      editorFlag,
      bidPageDetailFlag,
      history,
      bidCatalogId,
      bidCatalogHistoryId,
      bidVersion,
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
      tenderListSectionDs,
      bidPlanContentDs,
      editorFlag,
      bidPageDetailFlag,
      history,
      bidCatalogId,
      bidCatalogHistoryId,
      bidVersion,
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
