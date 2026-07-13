/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-21 17:44:42
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-07 17:21:27
 */
import React from 'react';
import {
  Form,
  Table,
  TextArea,
  TextField,
  NumberField,
  DatePicker,
  Lov,
  Select,
  Modal,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Card } from 'choerodon-ui';
import { DETAIL_CARD_TABLE_CLASSNAME } from 'utils/constants';
import AttachmentInfo from '../../components/Attachment';
import style from './index.less';

const ChangeMould = ({
  customizeForm,
  customizeTable,
  changeFormDs,
  changeTableDs,
  maExpandLineDs,
  showContent,
}) => {
  const itemLineCols = [
    {
      name: 'lineNum',
      width: 80,
    },
    {
      name: 'itemLov',
      width: 150,
      editor: true,
    },
    {
      name: 'itemName',
      width: 150,
      editor: true,
    },
    {
      name: 'categoryId',
      width: 300,
      editor: true,
    },
    {
      name: 'uomId',
      width: 150,
      editor: true,
    },
    {
      name: 'quantity',
      width: 150,
      editor: true,
    },
    {
      name: 'modelSpecs',
      width: 150,
      editor: true,
    },
  ];
  const expendLineCols = [
    {
      name: 'lineNum',
      width: 80,
    },
  ];

  return (
    <div>
      {customizeForm(
        {
          code: 'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.HEADER',
          dataSet: changeFormDs,
        },
        <Form dataSet={changeFormDs} columns={3} labelLayout="float">
          <Lov name="mouldPrincipalLov" />
          <TextField name="modelSpecs" />
          <Lov name="uomLov" />
          <NumberField name="shareQuality" />
          <NumberField name="mouldLife" />
          <NumberField name="mouldQuality" />
          <NumberField name="mouldValue" />
          <TextField name="moldingCycle" />
          <TextField name="machineTonnage" />
          <NumberField name="cavityQuality" />
          <Select name="mouldType" />
          <Select name="mouldOwner" />
          <DatePicker name="effectiveTimeFrom" />
          <DatePicker name="effectiveTimeTo" />
          <NumberField name="usedValue" />
          <NumberField name="remainValue" />
          <NumberField name="usedQuality" />
          <NumberField name="remainQuality" />
          <TextArea name="reason" />
        </Form>
      )}
      <div className={style['mould-card']}>
        <Card
          bordered={false}
          className={DETAIL_CARD_TABLE_CLASSNAME}
          bodyStyle={{ bordered: false }}
          title={intl.get('siec.mould.common.relateItemInfo').d('关联物料信息')}
        >
          {customizeTable(
            {
              code: 'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE',
              dataSet: changeTableDs,
            },
            <Table
              dataSet={changeTableDs}
              columns={itemLineCols}
              buttons={[
                'add',
                [
                  'delete',
                  {
                    icon: 'delete_sweep',
                    onClick: () => {
                      const { selected } = changeTableDs;
                      if (selected.some(e => e.get('maLineId'))) {
                        Modal.confirm({
                          title: intl
                            .get(`hzero.common.view.delete_selected_row_confirm`)
                            .d('确认删除选中行？'),
                          okText: intl.get('hzero.common.button.sure').d('确定'),
                          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                          onOk: () => {
                            changeTableDs.remove(selected);
                          },
                        });
                      } else {
                        changeTableDs.remove(selected);
                      }
                    },
                  },
                ],
              ]}
            />
          )}
        </Card>
      </div>
      <div className={style['mould-card']}>
        {showContent && (
          <Card
            bordered={false}
            className={DETAIL_CARD_TABLE_CLASSNAME}
            title={intl.get('siec.mould.common.expandLine').d('关联子模具信息')}
          >
            {customizeTable(
              {
                code: 'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE_EXPAND',
                dataSet: maExpandLineDs,
              },
              <Table
                dataSet={maExpandLineDs}
                columns={expendLineCols}
                buttons={[
                  'add',
                  [
                    'delete',
                    {
                      icon: 'delete_sweep',
                      onClick: () => {
                        const { selected } = maExpandLineDs;
                        if (selected.some(e => e.get('mouldAccountLineExpandId'))) {
                          Modal.confirm({
                            title: intl
                              .get(`hzero.common.view.delete_selected_row_confirm`)
                              .d('确认删除选中行？'),
                            okText: intl.get('hzero.common.button.sure').d('确定'),
                            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                            onOk: () => {
                              maExpandLineDs.remove(selected);
                            },
                          });
                        } else {
                          maExpandLineDs.remove(selected);
                        }
                      },
                    },
                  ],
                ]}
              />
            )}
          </Card>
        )}
      </div>
      <div className={style['mould-card']}>
        <Card
          bordered={false}
          className={DETAIL_CARD_TABLE_CLASSNAME}
          title={intl.get('siec.mould.model.common.attachment').d('附件')}
        >
          <AttachmentInfo
            attachmentUuid={changeFormDs.current?.get('attachmentUuid')}
            formDs={changeFormDs}
            customizeForm={customizeForm}
            code="SIEC.MOULD_PLATFORM.APPROVE.ATTACHMENTINFO"
          />
        </Card>
      </div>
    </div>
  );
};

export default ChangeMould;
