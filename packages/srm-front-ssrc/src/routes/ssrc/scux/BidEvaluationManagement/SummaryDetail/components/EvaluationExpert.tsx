import React, { useMemo } from 'react';
import { Table, Button, Modal, Form, DataSet, TextArea } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  confirmAndSummaryPageData,
} from '../../api';
import { useStore } from '../store/StoreProvider';

const EvaluationExpert: React.FC = () => {
  const {
    commonDs: {
      evaluationExpertDs,
    } = {},
    initData,
    prefix,
  } = useStore();

  // 中止评标
  const handleStopEvaluation = (record) => {
    const formDs = new DataSet({
      autoCreate: true,
      forceValidate: true,
      fields: [
        {
          name: 'attributeLongtext1',
          label: intl.get(`${prefix}.model.twnf.summary.stopReason`).d('中止原因'),
          type: FieldType.string,
          required: true,
        },
      ],
    });
    Modal.open({
      title: intl.get('scux.bidEvaluationManagement.view.message.stopEvaluation').d('中止评标'),
      destroyOnClose: true,
      children: (
        <Form dataSet={formDs} columns={1} labelLayout={LabelLayout.float}>
          <TextArea name="attributeLongtext1" />
        </Form>
      ),
      onOk: async () => {
        if (await formDs.validate()) {
          return confirmAndSummaryPageData({
            postType: 'TERMINATE',
            ...(record.toData() || {}),
          }).then(res => {
            if (getResponse(res)) {
              notification.success({});
              initData();
            };
          });
        };
      },
    });
  };

  const columns: ColumnProps[] = useMemo(() => [
    {
      name: 'expertName',
    },
    {
      name: 'evaluateLeaderFlag',
    },
    {
      name: 'attributeVarchar1',
    },
    {
      name: 'scoredStatus',
    },
    {
      header: intl.get('scux.bidEvaluationManagement.model.twnf.summary.stopEvaluation').d('中止评标'),
      renderer: ({ record }) => record?.get('scoredStatus') === 'NEW' ? (
        <Button
          funcType={FuncType.link}
          wait={1200}
          onClick={() => handleStopEvaluation(record)}
        >
          {intl.get('scux.bidEvaluationManagement.model.twnf.summary.stopEvaluation').d('中止评标')}
        </Button>
      ) : null,
    },
    {
      name: 'attributeLongtext1',
    },
  ], []);


  return evaluationExpertDs ? (
    <Table
      dataSet={evaluationExpertDs}
      columns={columns}
    />
  ) : null;
};

export default EvaluationExpert;
