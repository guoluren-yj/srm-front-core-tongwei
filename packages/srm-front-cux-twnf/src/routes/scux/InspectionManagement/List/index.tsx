import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { DataSet, Tabs, Button } from 'choerodon-ui/pro';

import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { stringify } from 'querystring';
import { observer } from 'mobx-react-lite';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

import OpenReferenceContractDrawer from '../ReferenceContract/Button';
import { TABS, tableDs, prefix, getTabValue } from './initialDs';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

const { TabPane } = Tabs;

const InspectionManagementList = ({ history }: any) => {
  const [tabKey, setTabKey] = useState<'ALL' | 'DETAIL'>('ALL');
  const [allDS, detailDS] = useMemo(() => TABS.map(t => new DataSet(tableDs(t.key))), []);

  const dsMap = useMemo(() => ({ ALL: allDS, DETAIL: detailDS }), [allDS, detailDS]);
  const tableDS = useMemo(() => dsMap[tabKey], [dsMap, tabKey]);

  useEffect(() => {
    tableDS.query();
  }, []);

  const handleToDetail = useCallback(
    (record: any, readOnly: boolean) => {
      history.push({
        pathname: '/scux/inspection-management/detail',
        search: stringify({
          inspHeaderId: record?.get('inspHeaderId'),
          readOnly: readOnly ? 1 : 0,
        }),
      });
    },
    [history]
  );
  
  const handleToContract = useCallback(
    (record: any) => {
      history.push({
        pathname: `/spcm/contract-workspace/view/${record.get('pcHeaderId')}`,
      });
    },
    [history]
  );

  const handleCreated = useCallback(
    (inspHeaderId?: any) => {
      if (inspHeaderId) {
        history.push({
          pathname: '/scux/inspection-management/detail',
          search: stringify({ inspHeaderId, readOnly: 0 }),
        });
      }
    },
    [history]
  );

  const columns = useMemo(() => {
    const commonCols: any[] = [
      { name: 'inspStatus' },
      {
        name: 'inspNum',
        width: 160,
        renderer: ({ value, record }: any) => (
          <Button
            funcType={FuncType.link}
            onClick={() => handleToDetail(record, !['NEW'].includes(record.get('inspStatus')))}
          >
            {value}
          </Button>
        ),
      },
      { name: 'inspTitle' },
      { name: 'companyName' },
      { name: 'createdName' },
      { name: 'creationDate' },
      { name: 'participantsMeaning' },
      { name: 'remark' },
    ];

    if (tabKey === 'ALL') {
      return commonCols;
    }

    return [
      { name: 'inspStatus' },
      {
        name: 'inspNumAndLineNum',
        width: 160,
        renderer: ({ value, record }: any) => (
          <Button
            funcType={FuncType.link}
            onClick={() => handleToDetail(record, ['CANCELLED', 'COMPLETED'].includes(record.get('inspStatus')))}
          >
            {value}
          </Button>
        ),
      },
      { name: 'inspTitle' },
      { name: 'companyName' },
      { name: 'pcNum',
        width: 160,
        renderer: ({ value, record }: any) => (
          <Button
            funcType={FuncType.link}
            onClick={() => handleToContract(record)}
          >
            {value}
          </Button>
        ),
       },
      { name: 'pcName' },
      { name: 'pcCompanyName' },
      { name: 'supplierCompanyName' },
      { name: 'taxIncludeAmount' },
      { name: 'attributeVarchar18Meaning' },
      { name: 'attributeVarchar10' },
      { name: 'pcCreatedName' },
      { name: 'attributeVarchar5Meaning' },
      { name: 'createdName' },
      { name: 'creationDate' },
      { name: 'participantsMeaning' },
      { name: 'remark' },
    ];
  }, [tabKey, handleToDetail]);

  const getQueryData = useCallback(() => {
    const queryData = tableDS?.queryDataSet?.current?.toData() || {};
    return filterNullValueObject(queryData);
  }, [tableDS]);

  const getSelectedKeys = useCallback(() => {
    const key = getTabValue(tabKey, 'primaryKey');
    if (!key) return {};
    return { [`${key}s`]: tableDS.selected.map((r: any) => r.get(key)) };
  }, [tabKey, tableDS]);

  const HeaderButtons = useMemo(
    () =>
      observer(({ dataSet }: any) => {
        const selected = dataSet?.selected || [];
        const exportUrl = getTabValue(tabKey, 'exportUrl');
        const buttons = [
          {
            name: 'create',
            child: intl.get('hzero.common.button.create').d('新建'),
            btnProps: {
              color: 'primary',
              icon: 'add',
              onClick: () =>
                OpenReferenceContractDrawer({
                  onCreated: handleCreated,
                }),
            },
          },
          {
            name: 'newExport',
            btnComp: ExcelExportPro,
            childFor: 'buttonText',
            hidden: tabKey === 'ALL',
            child:
              selected.length === 0
                ? intl.get('hzero.common.button.newExport').d('(新)导出')
                : intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出'),
            btnProps: {
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
              },
              exportAsync: false,
              requestUrl: exportUrl || '',
              queryParams: selected.length === 0 ? getQueryData() : getSelectedKeys(),
              method: 'POST',
              allBody: true,
            },
          },
        ].filter(Boolean);
        return <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />;
      }),
    [tabKey, getQueryData, getSelectedKeys, handleCreated]
  );

  return (
    <>
      <Header title={intl.get(`${prefix}.view.title`).d('点检管理')}>
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

export default React.memo(formatterCollections({ code: [prefix] })(InspectionManagementList));

