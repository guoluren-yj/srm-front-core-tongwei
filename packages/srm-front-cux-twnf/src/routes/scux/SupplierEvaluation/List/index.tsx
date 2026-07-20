import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { DataSet, Tabs, Button } from 'choerodon-ui/pro';

import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { stringify } from 'querystring';
import { observer } from 'mobx-react-lite';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { filterNullValueObject, getCurrentUserId } from 'hzero-front/lib/utils/utils';

import { TABS, tableDs, prefix, getTabValue, TabKeyType } from './initialDs';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

const { TabPane } = Tabs;

const handleToTenderDetail = (history: any, record: any) => {
  history.push({
    pathname: `/ssrc/new-project-setup/detail/${record.get('sourceProjectId')}`,
  });
};

const handleToDetail = (history: any, search: any) => {
  history.push({
    pathname: '/scux/supplier-evaluation/detail',
    search,
  });
};

const handleToSupplierEntryDetail = (history: any, record: any, type: string) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type,
  }));
};

const handleToEdit = (history: any, record: any) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type: 'pendingReview',
  }));
};

const handleToShortlistEdit = (history: any, record: any) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type: 'edit',
  }));
};

const handleToSubmit = (history: any, record: any) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type: 'submit',
  }));
};

const SupplierEvaluationList = ({ history }: any) => {
  const [tabKey, setTabKey] = useState<TabKeyType>('EVALUATE');
  const dsList = useMemo(() => TABS.map(t => new DataSet(tableDs(t.key))), []);

  const dsMap = useMemo(() => Object.fromEntries(TABS.map((t, i) => [t.key, dsList[i]])), [dsList]);
  const tableDS = useMemo(() => dsMap[tabKey], [dsMap, tabKey]);

  useEffect(() => {
    tableDS.query();
  }, []);

  const columns = useMemo(() => {
    const renderSourceProjectNum = ({ value, record }: any) => (
      <a
        onClick={() => handleToTenderDetail(history, record)}
      >
        {value}
      </a>
    );

    const renderNominationNum = ({ value, record }: any) => (
      <a
        onClick={() => handleToSupplierEntryDetail(history, record, 'view')}
      >
        {value}
      </a>
    );

    const renderFbcNumber = ({ value, record }: any) => {
      const url = record.get('fbcUrl');
      if (!value) return null;
      if (url) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        );
      }
      return <span>{value}</span>;
    };

    if (tabKey === 'EVALUATE') {
      return [
        { name: 'nominationStatusMeaning', width: 80 },
        {
          name: 'action',
          title: intl.get(`${prefix}.field.action`).d('操作'),
          align: 'center',
          width: 100,
          renderer: ({ record }: any) => (
            <Button funcType={FuncType.flat} onClick={() => handleToEdit(history, record)}>
              {intl.get(`${prefix}.button.review`).d('评审')}
            </Button>
          ),
        },
        { name: 'nominationNum', width: 160, renderer: renderNominationNum },
        { name: 'sourceProjectNum', width: 160, renderer: renderSourceProjectNum },
        { name: 'sourceProjectName', width: 200 },
        { name: 'companyName', width: 150 },
        { name: 'templateName', width: 150 },
        { name: 'bidDirectorName', width: 120 },
        { name: 'createdByName', width: 120 },
        { name: 'creationDate', width: 150 },
      ];
    }

  // 全部 t：根据状态显示不同操作按钮
    const currentUserId = getCurrentUserId();

    const renderAction = ({ record }: any) => {
      const isBidDirector = String(record.get('createdBy')) === String(currentUserId);
      const status = record.get('nominationStatus');

      // 新建 → 编辑（仅入围负责人）
      if (status === 'NEW' && isBidDirector) {
        return (
          <Button funcType={FuncType.flat} onClick={() => handleToShortlistEdit(history, record)}>
            {intl.get(`${prefix}.button.edit`).d('编辑')}
          </Button>
        );
      }

      // 待评审 → 变更（入围负责人）/ 评审（评审人员，满足任一角色）
      if (status === 'PENDING_REVIEW') {
        const isReviewer = record.get('technologyUserFlag') === '1'
          || record.get('businessUserFlag') === '1'
          || record.get('financeUserFlag') === '1';
        return (
          <>
            {isBidDirector && (
              <Button funcType={FuncType.flat} onClick={() => handleToShortlistEdit(history, record)}>
                {intl.get(`${prefix}.button.change`).d('变更')}
              </Button>
            )}
            {isReviewer && (
              <Button funcType={FuncType.flat} onClick={() => handleToEdit(history, record)}>
                {intl.get(`${prefix}.button.review`).d('评审')}
              </Button>
            )}
          </>
        ) || null;
      }

      // 待发布 → 提交 / 变更（仅入围负责人）
      if (status === 'TO_BE_RELEASED' && isBidDirector) {
        return (
          <>
            <Button funcType={FuncType.flat} onClick={() => handleToSubmit(history, record)}>
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
            <Button funcType={FuncType.flat} onClick={() => handleToShortlistEdit(history, record)}>
              {intl.get(`${prefix}.button.change`).d('变更')}
            </Button>
          </>
        );
      }

      // 审批拒绝 → 提交（仅入围负责人）
      if (status === 'REJECTED' && isBidDirector) {
        return (
          <Button funcType={FuncType.flat} onClick={() => handleToSubmit(history, record)}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
        );
      }

      return null;
    };

    return [
      { name: 'nominationStatusMeaning', width: 80 },
      {
        name: 'action',
        title: intl.get(`${prefix}.field.action`).d('操作'),
        width: 200,
        align: 'center',
        renderer: renderAction,
      },
      { name: 'nominationNum', width: 160, renderer: renderNominationNum },
      { name: 'sourceProjectNum', width: 160, renderer: renderSourceProjectNum },
      { name: 'sourceProjectName', width: 200 },
      { name: 'companyName', width: 150 },
      { name: 'templateName', width: 150 },
      { name: 'bidDirectorName', width: 120 },
      { name: 'createdByName', width: 120 },
      { name: 'fbcNumber', width: 150, renderer: renderFbcNumber },
      { name: 'fbcUrl', width: 200 },
      { name: 'fbcResult', width: 150 },
      { name: 'financePersonName', width: 120 },
      { name: 'technicalPersonName', width: 120 },
      { name: 'supManagerPersonName', width: 120 },
      { name: 'reviewType', width: 120 },
      { name: 'creationDate', width: 150 },
    ];
  }, [tabKey, history, intl, prefix]);

  const getQueryData = useCallback(() => {
    const queryData = tableDS?.queryDataSet?.current?.toData() || {};
    return filterNullValueObject(queryData);
  }, [tableDS]);

  const getSelectedKeys = useCallback(() => {
    const key = getTabValue(tabKey, 'primaryKey');
    if (!key) return {};
    return { [`${key}s`]: tableDS.selected.map((r: any) => r.get(key)) };
  }, [tabKey, tableDS]);

  const handleExport = useCallback(() => {
    let data = {};
    if (tableDS.selected.length > 0) {
      data = getSelectedKeys();
    } else {
      data = getQueryData();
    }
    const exportUrl = getTabValue(tabKey, 'exportUrl');
    downloadFileByAxios({
      requestUrl: exportUrl,
      method: 'POST',
      queryData: data,
    });
  }, [tableDS, tabKey]);

  const getButtonConfigs = (selected: any[]) => {
    const buttonConfigs = {
      ALL: [
        {
          name: 'newExport',
          child: selected.length === 0
            ? intl.get('hzero.common.button.newExport').d('(新)导出')
            : intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出'),
          btnProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            onClick: () => handleExport(),
          },
        },
      ],
    };

    return buttonConfigs[tabKey] || [];
  };

  const HeaderButtons = useMemo(
    () =>
      observer(({ dataSet }: any) => {
        const selected = dataSet?.selected || [];
        const buttons = getButtonConfigs(selected);

        return <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />;
      }),
    [tabKey, history, intl]
  );

  return (
    <>
      <Header title={intl.get(`${prefix}.view.title`).d('入围供应商评审')}>
        <HeaderButtons dataSet={tableDS} />
      </Header>
      <Content>
        <Tabs
          animated={false}
          activeKey={tabKey}
          onChange={(key: any) => {
            setTabKey(key);
            dsMap[key].query(dsMap[key].currentPage);
          }}
        >
          {TABS.map(t => (
            <TabPane key={t.key} tab={t.name}>
              <div style={{ height: 'calc(100vh - 242px)' }}>
                <FilterBarTable
                  virtual
                  virtualCell
                  columns={columns as any}
                  dataSet={dsMap[t.key] as any}
                  style={{ maxHeight: 'calc(100% - 22px)' }}
                  customizable
                  customizedCode={t.customizedCode}
                  searchCode={t.searchCode}
                  filterBarConfig={{
                    autoQuery: false,
                  }}
                />
              </div>
            </TabPane>
          ))}
        </Tabs>
      </Content>
    </>
  );
};

export default React.memo(formatterCollections({ code: [prefix] })(SupplierEvaluationList));
