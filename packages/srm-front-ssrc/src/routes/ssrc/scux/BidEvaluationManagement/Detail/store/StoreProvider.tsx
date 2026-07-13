import React, { createContext, FunctionComponent, useMemo, ReactNode, useContext, useEffect, useState } from 'react';
import { useDataSet, DataSet } from 'choerodon-ui/pro';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import { isNil } from 'lodash';
import querystring from 'querystring';
import { set, get, toJS } from 'mobx';

import intl from 'utils/intl';

import {
  evaluationHeaderDataSet,
  evaluationItemsDataSet,
} from './storeDS';

const prefix = 'scux.bidEvaluationManagement';

// 定义数据项接口类型，修复 TS 类型推断问题
interface EvaluationScoreItem {
  sumPassStatus?: string;
  sumPassStatusMeaning?: string;
  approvedCount?: number | string;
  allExpertCount?: number | string;
  supplierScoreTitle?: string;
  sumIndicScore?: any;
  indicScore?: any;
  detailEnabledFlag?: boolean;
  evaluateScoreLineDetailS?: any[];
  teamWeight?: any;
  indicateName?: string;
  [key: string]: any;
}

// 定义 Context 值类型
interface StoreContextValue {
  editorFlag: boolean;
  evaluateScoreId?: string | number;
  commonDs?: {
    evaluationHeaderDs: DataSet;
    evaluationItemsDs: DataSet;
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
  evaluateScoreId: '',
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
      evaluateScoreId?: string | number;
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
    // location = { pathname: '', search: '' },
    history,
  } = props;

  const { params } = match;
  // const { pathname, search } = location;

  const { evaluateScoreId, pageType } = (params || {});

  // 页面编辑标识
  const editorFlag = useMemo(() => {
    // 根据实际业务逻辑判断编辑状态
    return ['tech', 'price'].includes(pageType || '');
  }, [pageType]);

  // 解析 URL 查询参数
  // const routerParams = search ? querystring.parse(search.substr(1)) : {};

  // 评标头信息
  const evaluationHeaderDs = useDataSet(() => evaluationHeaderDataSet({ evaluateScoreId }), [evaluateScoreId]);

  // 评分项
  const evaluationItemsDs = useDataSet(() => evaluationItemsDataSet({ scoreFlag: !editorFlag }), [editorFlag]);

  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    initData();
  }, []);
  // 处理供应商数据源
  const renderDataSource = (dataSource: EvaluationScoreItem[] = []) => {
    const arrayItem: any[] = [];
    let totalDataSource: any = {};
    const supplierDataSource = dataSource.map((item: EvaluationScoreItem = {} as any) => {
      const { detailEnabledFlag, evaluateScoreLineDetailS = [], ...otherItem } = item || {};
      const totalContent =
        item.sumPassStatus === 'ALL_PASS'
          ? item.sumPassStatusMeaning || ''
          : item.sumPassStatusMeaning
          ? `${item.sumPassStatusMeaning}${item.approvedCount}/${item.allExpertCount}`
          : '';
      totalDataSource = {
        ...totalDataSource,
        indicateNameFlag: 1,
        isEditing: false,
        redFlag: item.sumPassStatus === 'UN_PASS',
        supplierScore: item.supplierScoreTitle === 'PASS' ? totalContent : item.sumIndicScore,
        indicScore: item.supplierScoreTitle === 'PASS' ? totalContent : item.sumIndicScore,
        indicateName: intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总'),
      };
      if (Number(detailEnabledFlag)) {
        let subtotalDataSource = {};
        const elementItem = evaluateScoreLineDetailS.map((element) => {
          let elementDetail = {};
          elementDetail = { ...element, isEditing: false };
          subtotalDataSource = {
            ...subtotalDataSource,
            indicateNameFlag: 1,
            isEditing: false,
            supplierScore: item.indicScore,
            indicScore: item.indicScore,
            indicateName: intl.get('ssrc.expertScoring.view.message.subtotal').d('小计'),
          };
          return elementDetail;
        });
        elementItem.unshift({
          ...otherItem,
          isEditing: true,
          indicateNameFlag: 0,
          teamWeight: otherItem.teamWeight,
          indicateName: otherItem.indicateName,
        });
        elementItem.push(subtotalDataSource);
        return elementItem;
      } else {
        return { ...item, isEditing: true };
      }
    });
    supplierDataSource.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    arrayItem.push(totalDataSource);
    return arrayItem;
  };

  // 初始化数据
  const initData = async () => {
    setPageLoading(true);
    try {
      const headerRes = await evaluationHeaderDs.query();
      if (headerRes) {
        const { scoreList } = headerRes;
        evaluationItemsDs.loadData(renderDataSource(scoreList));
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
        evaluationItemsDs,
      },
      editorFlag,
      history,
      evaluateScoreId,
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
      evaluationItemsDs,
      editorFlag,
      history,
      evaluateScoreId,
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
