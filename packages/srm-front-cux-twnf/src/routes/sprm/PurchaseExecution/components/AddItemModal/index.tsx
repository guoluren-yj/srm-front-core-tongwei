import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';

import FormPro from '@/components/FormPro';
import { formDataSet, intlPrompt, saveDetailApi } from './initialDs';
import { useComputed } from 'mobx-react-lite';

const AddItemModal = (props) => {
  const { modal, record, dataSet } = props;
  const outData = record.toData();
  const formDs = useMemo(() => new DataSet(formDataSet(outData)), [outData]);
  const onlyProductFlag = useMemo(()=> ['SOURCE_PRO', 'SOURCE_RFX', 'SOURCE_BID'].includes(outData.executionStatusCode), [outData])

  useEffect(() => {
    initData();
    updateModal();
  }, [formDs]);

  const initData = () => {
    const data = {
      ...outData,
      productName: null,
      productNum: null,
    }
    formDs.loadData([data]);
  };

  const updateModal = () => {
    if(modal) {
      modal.handleOk(handleSave);
    }
  };

  // 保存 / 提交
  const handleSave = useCallback(
    async () => {
      const flag = await formDs.validate();
      if (!flag) {
        return false;
      }
      const formData = formDs.current?.toJSONData();
      saveDetailApi(formData)
        .then(response => {
          if (getResponse(response)) {
            notification.success({});
            dataSet.query();
          }
        });
    },
    [formDs]
  );

  const fields = useComputed(
    () => [
      { name: 'productLov', _type: 'Lov' },
      { name: 'itemCodeLov', _type: 'Lov', disabled: onlyProductFlag },
      { name: 'uomNameLov', _type: 'Lov', disabled: onlyProductFlag },
      { name: 'itemCategoryLov', _type: 'Lov', disabled: onlyProductFlag },
      { name: 'attributeVarchar13', _type: 'TextField', disabled: onlyProductFlag },
      { name: 'attributeVarchar14', _type: 'TextField', disabled: onlyProductFlag },
      { name: 'itemName', _type: 'TextField', disabled: onlyProductFlag },
      { name: 'itemModel', _type: 'TextField', disabled: onlyProductFlag },
      { name: 'attributeVarchar15', _type: 'TextField', disabled: onlyProductFlag },
      { name: 'attributeVarchar17', _type: 'TextField', show: ({ record }) => !record.get('categoryId'), disabled: onlyProductFlag },
      { name: 'attributeVarchar17Lov', _type: 'Lov', show: ({ record }) => !!record.get('categoryId'), disabled: onlyProductFlag },
      { name: 'itemSpecs', _type: 'TextField', disabled: onlyProductFlag },
      { name: 'attributeVarchar16', _type: 'TextField', disabled: onlyProductFlag },
    ].filter(Boolean),
    [formDs, onlyProductFlag]
  );

  return (
    <>
      <FormPro dataSet={formDs} columns={3} fields={fields} />
    </>
  );
};

export default React.memo(
  formatterCollections({ code: [intlPrompt, 'hzero.common'] })(AddItemModal)
);
