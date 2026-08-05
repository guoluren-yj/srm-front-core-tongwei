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
  technicalFileDS,
  bidPlanContentDS,
} from './storeDS';

// 定义 Context 值类型
interface StoreContextValue {
  editorFlag: boolean;
  techFileId?: string | number;
  commonDs?: {
    baseInfoDs: DataSet;
    technicalFileDs: DataSet;
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
  techFileId: '',
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
      techFileId?: string | number;
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

  const { techFileId } = params || {};

  // 解析 URL 查询参数（修复空字符串解析问题）
  const routerParams = search ? querystring.parse(search.substr(1)) : {};
  const { sourceProjectId = '' } = routerParams as Record<string, string>;
  const rawTechVersion = routerParams.techVersion;
  const techVersion = Array.isArray(rawTechVersion)
    ? rawTechVersion[0]
    : (rawTechVersion || '');

  // 基础信息
  const baseInfoDs = useDataSet(() => baseInfoDS({ techFileId }), []);

  // 招标节点
  const technicalFileDs = useDataSet(() => technicalFileDS(), []);

  // 招标内容
  const bidPlanContentDs = useDataSet(() => bidPlanContentDS({ sourceProjectId }), [sourceProjectId]);

  const [pageLoading, setPageLoading] = useState(false);
  const techFileStatus = useObserver(() => baseInfoDs.current?.get('techFileStatus'));

  // 页面编辑标识：版本查看时不可编辑
  const editorFlag = useMemo(() => {
    return !techVersion
      && ['NEW', 'APPROVED', 'CHANGING'].includes(techFileStatus)
      && pathname.includes('/scux/ssrc/technical-documents-workbench/tech-update');
  }, [techFileStatus, pathname, techVersion]);

  // bid明细页面
  const bidPageDetailFlag = useMemo(() => {
    return pathname.includes('/scux/ssrc/technical-documents-workbench/tech-detail');
  }, [pathname]);

  useEffect(() => {
    if (editorFlag) {
      technicalFileDs.selection = DataSetSelection.multiple;
    };
  }, [editorFlag]);

  // 初始化数据
  const initData = useCallback(async () => {
    setPageLoading(true);
    try {
      // 版本查看时手动请求历史信息，否则用 DataSet 查询当前数据
      if (techVersion) {
        const res = getResponse(
          await request(
            `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/v8iakAicH6oqZZdRutibdBmeDZVuxxhCyc5UMK4IbqKu9o`,
            {
              method: 'POST',
              body: {
                postType: 'GET_HISTORY',
                techFileId,
                techVersion,
              },
            }
          )
        );
        if (baseInfoDs) {
          baseInfoDs.loadData(res ? [res] : []);
        }
        if (technicalFileDs) {
          technicalFileDs.loadData(res?.techFileDetailList || []);
        }
      } else {
        const results = await Promise.all([
          baseInfoDs?.query(),
          bidPlanContentDs?.query(),
        ]);
        if (results[0] && !results[0]?.failed) {
          technicalFileDs?.loadData(results[0].techFileDetailList || []);
        }
      }
    } finally {
      setPageLoading(false);
    }
  }, [baseInfoDs, technicalFileDs, bidPlanContentDs, techFileId, techVersion]);

  useEffect(() => {
    initData();
  }, [initData]);

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
        technicalFileDs,
        bidPlanContentDs,
      },
      editorFlag,
      bidPageDetailFlag,
      history,
      techFileId,
      techVersion,
      pageLoading,
      setPageLoading,
      initData,
      setStoreData: reactionStoreData.setStoreData,
      getStoreData: reactionStoreData.getStoreData,
      storeData: toJS(reactionStoreData.storeData), // 转为普通对象，避免代理对象导致的语法问题
    }),
    [
      baseInfoDs,
      technicalFileDs,
      bidPlanContentDs,
      editorFlag,
      bidPageDetailFlag,
      history,
      techFileId,
      techVersion,
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
