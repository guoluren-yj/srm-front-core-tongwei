import React, { useMemo, useCallback } from 'react';
import { Collapse } from 'choerodon-ui';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { Header } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { parse } from 'querystring';
import FormPro from '@/components/FormPro';
import { formDataSet, lineDataSet, intlPrompt } from './initialDs';
import { openDocumentDetailModal } from '../modals/DocumentDetailModal';
import styles from './index.less';

const { Panel } = Collapse;

const Detail = ({ location, history }) => {
  const params = parse(location.search.substring(1));
  const fbcNum = useMemo(() => params.fbcNum, [params]);
  const backPath = useMemo(() => `/scux/purchase-method-change/list`, []);

  const formDs = useMemo(() => new DataSet(formDataSet(fbcNum)), [fbcNum]);
  const lineDs = useMemo(() => new DataSet(lineDataSet(fbcNum)), [fbcNum]);

  const fields = useMemo(
    () => [
      { name: 'fbcNum', _type: 'TextField' },
      { name: 'title', _type: 'TextField' },
      { name: 'applyUser', _type: 'TextField' },
      { name: 'applyTime', _type: 'DateTimePicker' },
      { name: 'status', _type: 'TextField' },
      { name: 'currencyCode', _type: 'TextField' },
      { name: 'amount', _type: 'Currency' },
      { name: 'amountStr', _type: 'TextField' },
      { name: 'company', _type: 'TextField', colSpan: 3 },
      { name: 'purchaseRange', _type: 'TextArea', colSpan: 2 },
      { name: 'processLink', _type: 'TextField', renderer: ({ value }: any) => value ? <Button funcType={FuncType.link} onClick={() => handleProcessLinkClick(value)}>{intl.get('hzero.common.button.view').d('查看')}</Button> : null },
      { name: 'purchaseReson', _type: 'TextArea', colSpan: 2 },
      { name: 'attachment', _type: 'Attachment' },
    ],
    []
  );

  const handleProcessLinkClick = useCallback((link: string) => {
    window.open(link, '_blank');
  }, []);

  const columns = useMemo(
    () => [
      { name: 'lineNum', width: 80 },
      { name: 'requestUser', width: 120 },
      { name: 'requestTime', width: 150 },
      { name: 'requestNum', width: 150 },
      { name: 'dipRequestNum', width: 150 },
      { name: 'projectCode', width: 150 },
      { name: 'projectName', width: 200 },
      { name: 'executionAmount', width: 130 },
      {
        name: 'executionLink',
        width: 120,
        renderer: ({ record }: any) =>
          record.get('dipRequestNum') ? (
            <Button
              funcType={FuncType.link}
              onClick={() => openDocumentDetailModal(record.get('dipRequestNum'))}
            >
              {intl.get('scux.purchaseMethodChange.button.documentDetail').d('单据详情')}
            </Button>
          ) : null,
      },
      { name: 'remark', width: 200 },
    ],
    []
  );

  return (
    <>
      <Header
        title={intl.get(`${intlPrompt}.view.detailTitle`).d('采购方式变更详情')}
        backPath={backPath}
      />
      <div className={styles['detail-container']}>
        <Collapse
          ghost
          expandIconPosition="text-right"
          defaultActiveKey={['baseInfo', 'projectInfo']}
        >
          <Panel
            key="baseInfo"
            header={intl.get(`${intlPrompt}.view.baseInfo`).d('基本信息')}
          >
            <FormPro dataSet={formDs} columns={3} fields={fields} readOnly />
          </Panel>
          <Panel
            key="projectInfo"
            header={intl.get(`${intlPrompt}.view.projectInfo`).d('项目（需求）信息')}
          >
            <Table dataSet={lineDs} columns={columns} />
          </Panel>
        </Collapse>
      </div>
    </>
  );
};

export default React.memo(
  formatterCollections({ code: [intlPrompt, 'hzero.common'] })(Detail)
);
