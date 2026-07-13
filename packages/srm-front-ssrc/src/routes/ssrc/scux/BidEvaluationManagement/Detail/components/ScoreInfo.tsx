import React, { useMemo } from 'react';
import { Popover } from 'choerodon-ui';
import { Table, NumberField, Select, Form, TextArea, Attachment, Output } from 'choerodon-ui/pro';
import { isUndefined } from 'lodash';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import { scoreIntervalRender, zeroAmountScoreRender } from '@/utils/renderer';

import { useStore } from '../store/StoreProvider';
import Style from '../index.less';

const EvaluationInfo: React.FC = () => {
  const {
    commonDs: { evaluationItemsDs, evaluationHeaderDs } = {},
    editorFlag,
  } = useStore();

  const renderCell = (record, name) => {
    if (!isUndefined(record.get('indicateNameFlag'))) {
      if (record.get('indicateNameFlag')) {
        return {
          colSpan: name === 'indicateName' ? 2 : 1,
          hidden: name === 'indicateRemark',
        };
      } else {
        return {
          colSpan: name === 'indicateName' ? 4 : 1,
          hidden: name !== 'indicateName',
        };
      }
    }
    return {
      colSpan: 1,
      hidden: false,
    };
  };

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'indicateName',
        width: 200,
        onCell: ({ record }) => renderCell(record, 'indicateName'),
        renderer: ({ value, record }) => {
          return !isUndefined(record?.get('indicateNameFlag')) && record?.get('indicateNameFlag') ? (
            <span style={{ fontWeight: 'bold' }}>{value}</span>
          ) : (
            <span>
              {
                <Popover placement="topLeft" content={value}>
                  {value}
                </Popover>
              }
            </span>
          );
        },
      },
      {
        name: 'indicateRemark',
        width: 300,
        onCell: ({ record }) => renderCell(record, 'indicateRemark'),
        renderer: ({ value, record }) => {
          return !isUndefined(record?.get('indicateNameFlag')) && !record?.get('indicateNameFlag')
            ? ''
            : value;
        },
      },
      {
        name: 'betweenScore',
        width: 80,
        onCell: ({ record }) => renderCell(record, 'betweenScore'),
        renderer: ({ record }) =>
          record?.get('indicateType') === 'SCORE'
            ? scoreIntervalRender(record.get('minScore'), record.get('maxScore'))
            : '',
      },
      {
        name: 'supplierScore',
        width: 180,
        className: Style['scux-twnf-indicate-table-cell'],
        onCell: ({ record }) => renderCell(record, 'supplierScore'),
        renderer: ({ record }) => {
          if (!record) return null;
          return isUndefined(record?.get('indicateNameFlag')) && !record?.get('indicateNameFlag') ? (
            record.get('indicateType') === 'SCORE' ? (
              Number(record.get('zeroAmountScoreFlag')) ? (
                zeroAmountScoreRender()
              ) : (
                <NumberField name="indicScore" record={record} />
              )
            ) : (
              <Select name="passStatus" record={record} />
            )
          ) : (
            <span
              style={{
                fontWeight: 'bold',
                marginLeft: 8,
                color: Number(record.get('redFlag')) ? 'red' : '',
              }}
            >
              {record.get('supplierScore')}
            </span>
          );
        },
      },
      {
        name: 'teamWeight',
        renderer: ({ value }) => (value ? `${value}%` : null),
      },
      {
        name: 'attributeVarchar1',
      },
      {
        name: 'indicWeight',
        renderer: ({ value }) => (value ? `${value}%` : null),
      },
    ];
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Form
          dataSet={evaluationHeaderDs}
          columns={2}
          useWidthPercent
          labelLayout={LabelLayout.float}
        >
          {editorFlag ? <Select name="suggestInvalidFlag"/> : <Output name="suggestInvalidFlag" />}
          <Attachment name="attachmentUuid" readOnly={!editorFlag} />
          {editorFlag ? <TextArea name="expertSuggestion" colSpan={2} newLine /> : <Output name="expertSuggestion" colSpan={2} newLine/>}
        </Form>
      </div>
      {evaluationItemsDs && (
        <Table
          dataSet={evaluationItemsDs}
          columns={columns}
        />
      )}
    </div>
  );
};

export default EvaluationInfo;
