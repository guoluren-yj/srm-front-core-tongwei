import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Table, useDataSet, Select, NumberField, CheckBox, Button, Spin } from 'choerodon-ui/pro';
import { useComputed, observer } from 'mobx-react-lite';
import { noop } from 'lodash';
import uuidv4 from 'uuid/v4';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';

import HeadLine from '@/components/HeadLine';
import FormPro from '@/routes/sagm/SagmWorkbench/Comps/FormPro';

import { basicInfoDataSet, detailTableLineDataSet } from '../storeDs';
import { headerOperateData, queryData } from '../api';

const Index = (props) => {
  const { readOnly, ruleId, modal, onFetchList = noop } = props;

  const formDs = useDataSet(() => basicInfoDataSet(), []);
  const lineDs = useDataSet(() => detailTableLineDataSet(), []);

  // 页面loading
  const [loading, setLoading] = useState(false);

  const showLineFlag = useComputed(() => {
    return formDs?.current?.get('pricingMethod') === 'J02';
  }, [formDs]);

  useEffect(() => {
    if (!readOnly) {
      modal.handleOk(() => {
        return readOnly ? true : handleSave();
      });
      modal.update({
        footer: (okBtn, cancelBtn) => {
          return [
            okBtn,
            <Button onClick={() => handleSave(true)}>
              {intl.get('sagm.common.btn.saveAndClose').d('保存并关闭')}
            </Button>,
            cancelBtn,
          ];
        },
      });
    }
  }, [readOnly, modal]);

  useEffect(() => {
    init();
  }, [ruleId]);

  const init = () => {
    if (ruleId) {
      fetchDetail();
    } else {
      formDs.create();
    }
  };

  const fetchDetail = (payload) => {
    const { ruleId: newRuleId } = payload || {};
    if (ruleId || newRuleId) {
      queryData({
        ruleId: ruleId || newRuleId,
      }).then((res) => {
        if (getResponse(res)) {
          const { lines = [], ...other } = res;
          formDs.loadData([other]);
          if (res.pricingMethod === 'J02' && lines.length > 0) {
            lineDs.loadData(lines);
          }
        }
      });
    }
  };

  // 校验页面数据
  const validatePageData = () => {
    // 验证阶梯逻辑
    if (formDs?.current?.get('pricingMethod') === 'J02' && lineDs.length > 1) {
      for (let i = 1; i < lineDs.length; i++) {
        const currentRecord = lineDs.get(i);
        const prevRecord = lineDs.get(i - 1);
        const currentStart = currentRecord.get('quantityStart');
        const prevEnd = prevRecord.get('quantityEnd');

        if (currentStart < prevEnd) {
          notification.warning({
            message: '后一行的数量起必须大于等于前一行的数量止！',
          });
          return Promise.resolve(false);
        }
      }
    }

    return Promise.all([
      formDs.validate(),
      formDs?.current?.get('pricingMethod') === 'J02' ? lineDs.validate() : true,
    ]).then((ele) => ele.every((e) => e));
  };

  // 获取页面数据
  const getPageData = () => {
    if (formDs?.current?.get('pricingMethod') === 'J02') {
      return {
        ...formDs.current?.toData(),
        lines: lineDs.toData(),
      };
    } else {
      return formDs.current?.toData();
    }
  };

  // 保存
  const handleSave = async (closeFlag = false) => {
    setLoading(true);
    try {
      if (await validatePageData()) {
        headerOperateData({
          operateType: 'save',
          ...(getPageData() || {}),
        }).then((res) => {
          if (getResponse(res)) {
            notification.success({});
            fetchDetail({ newRuleId: res?.header?.ruleId });
            onFetchList();
            if (closeFlag) {
              modal.close();
            }
          }
        });
      } else {
        notification.warning({
          message: intl
            .get('scux.feeRuleManagement.view.message.title.validationMessage')
            .d('页面数据校验不通过！'),
        });
      }
      setLoading(false);
      return false;
    } catch (error) {
      setLoading(false);
    }
  };

  // 费用表单字段
  const formFields = useMemo(
    () => [
      {
        name: 'postageName',
      },
      {
        name: 'postageType',
        FormField: Select,
        disabled: ruleId,
      },
      {
        name: 'pricingMethod',
        FormField: Select,
        clearButton: false,
        disabled: ruleId,
      },
      {
        name: 'taxInclusivePrice',
        FormField: NumberField,
        show: ({ record }) => {
          if (record) {
            // 计价方式为固定费用显示
            return record.get('pricingMethod') === 'J01';
          }
        },
      },
      {
        name: 'postageStatus',
        FormField: CheckBox,
      },
    ],
    [ruleId]
  );

  // 表格列
  const columns = useMemo(
    () => [
      {
        name: 'quantityStart',
        editor: !readOnly,
      },
      {
        name: 'quantityEnd',
        editor: !readOnly,
      },
      {
        name: 'taxInclusivePrice',
        editor: !readOnly,
      },
    ],
    [readOnly]
  );

  // 新建行
  const handleCreate = useCallback(() => {
    const nextTableLength = lineDs.length + 1;

    const lineData = {
      temporaryId: uuidv4(), // 新增的临时id
    };

    if (lineDs.length) {
      // 上一行的至作为下行的从
      const lastLineRecord = lineDs.get(lineDs.length - 1);
      const quantityEnd = lastLineRecord ? lastLineRecord.get('quantityEnd') : null;
      if (quantityEnd) {
        lineData.quantityStart = quantityEnd;
      }
    }

    lineDs.create(lineData, nextTableLength);
  }, [lineDs]);

  // 删除行
  const handleDelete = useCallback(async () => {
    const { selected } = lineDs;

    if (!selected || selected.length === 0) {
      notification.warning({
        message: intl.get('scux.feeRuleManagement.view.message.selectDataTips').d('请选择数据！'),
      });
      return;
    }

    const unAddAllLines = lineDs.filter((newItem) => newItem.get('lineId'));
    const oldData = selected.filter((newItem) => newItem.get('lineId'));

    // 对于新增的行，可以直接删除
    if (!oldData?.length) {
      lineDs.remove(selected, 1);
    }

    // 对于已保存的行，必须从最后一行开始删除
    if (oldData.length > 0) {
      // 使用索引来检查是否是最后几行
      const allIndices = unAddAllLines.map((line, index) => index).sort((a, b) => a - b);
      const selectedIndices = oldData
        .map((line) => unAddAllLines.indexOf(line))
        .sort((a, b) => a - b);

      // 检查是否是最后几行
      const lastIndices = allIndices.slice(-oldData.length);
      const isLastLines = selectedIndices.every((index, i) => index === lastIndices[i]);

      if (!isLastLines) {
        notification.warning({
          message: intl
            .get('scux.feeRuleManagement.view.message.deleteLastLine')
            .d('只能从最后一行开始删除！'),
        });
        return;
      }
    }

    try {
      const result = await lineDs.delete(oldData, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
      if (result && result?.success) {
        // 清除缓存并刷新数据
        lineDs.clearCachedRecords();
        lineDs.unSelectAll();
        lineDs.clearCachedSelected();
        fetchDetail();
      }
    } catch (e) {
      throw e;
    }
  }, [lineDs]);

  // 费用明细行-表格按钮
  const buttons = useMemo(
    () => [
      [
        'add',
        {
          onClick: handleCreate,
          wait: 500,
        },
      ],
      [
        'delete',
        {
          onClick: handleDelete,
        },
      ],
    ],
    []
  );
  return (
    <Spin spinning={loading}>
      <FormPro columns={3} dataSet={formDs} readOnly={readOnly} fields={formFields} />
      {!!showLineFlag && (
        <>
          <HeadLine
            style={{ marginTop: '32px' }}
            title={intl.get('scux.feeRuleManagement.view.title.feeDetailLine').d('费用明细行')}
          />
          <Table dataSet={lineDs} columns={columns} buttons={buttons} />
        </>
      )}
    </Spin>
  );
};

export default observer(Index);
