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
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

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

const handleToSupplierEntryDetail = (history: any, record: any) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type: 'readOnly',
  }));
};

const handleToEdit = (history: any, record: any) => {
  handleToDetail(history, stringify({
    nominationHeaderId: record?.get('nominationHeaderId'),
    type: 'pendingReview',
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
        onClick={() => handleToSupplierEntryDetail(history, record)}
      >
        {value}
      </a>
    );

    const baseColumns = [
      { name: 'nominationStatusMeaning', width: 100 },
      { name: 'nominationNum', width: 160, renderer: renderNominationNum },
      { name: 'sourceProjectNum', width: 160, renderer: renderSourceProjectNum },
      { name: 'sourceProjectName', width: 200 },
      { name: 'companyName', width: 150 },
      { name: 'templateName', width: 150 },
      { name: 'bidDirectorName', width: 120 },
      { name: 'financePerson', width: 120 },
      { name: 'technicalPerson', width: 120 },
      { name: 'supManagerPerson', width: 120 },
      { name: 'reviewType', width: 120 },
      { name: 'creationDate', width: 150 },
    ];

    if (tabKey === 'EVALUATE') {
      return [
        { name: 'nominationStatusMeaning', width: 100 },
        {
          name: 'action',
          title: intl.get(`${prefix}.field.action`).d('操作'),
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
        { name: 'creationDate', width: 150 },
      ];
    }

    return baseColumns;
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
