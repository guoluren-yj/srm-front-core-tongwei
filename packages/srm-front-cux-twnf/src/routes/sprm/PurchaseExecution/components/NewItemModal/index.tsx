import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';

import FormPro from '@/components/FormPro';
import { formDataSet, intlPrompt, saveDetailApi } from './initialDs';


const NewItemModal = (props) => {
  const { modal, pageData, fromPage } = props; 
  const { record: outerRecord, dataSet: outerDataSet } = pageData;
  const formDs = useMemo(() => new DataSet(formDataSet()), []);

  useEffect(() => {
    initData();
    updateModal();
  }, [formDs]);

  const initData = () => {
    const outData = outerRecord.toData();
    const data = fromPage === 'purchaseExecution' ? {
      ...outData,
    } : {
      ...outData,
      attributeVarchar13: outData.attributeVarchar10,
      attributeVarchar14: outData.attributeVarchar11,
      attributeVarchar15: outData.attributeVarchar12,
      attributeVarchar17: outData.brand,
      attributeVarchar16: outData.attributeVarchar13,
      itemSpecs: outData.specs,
      itemModel: outData.model,
      itemDesc: outData.commonName,
      categoryName: outData.itemCategoryName,
      categoryId: outData.itemCategoryId,
      categoryCode: outData.itemCategoryCode,
      uomName: outData.uomIdMeaning,
    }
    formDs.loadData([data]);
  };

  const updateModal = () => {
    if(modal) {
      modal.update({
        footer: (okBtn, cancelBtn) => [okBtn, cancelBtn],
        onOk: handleSave,
        title: '物料新增',
      });
    }
  };

  // 保存 / 提交
  const handleSave = useCallback(
    async () => {
      const flag = await formDs.validate();
      if (!flag) {
        return;
      }
      const formData = formDs.current?.toJSONData();
      saveDetailApi(formData)
        .then(response => {
          if (getResponse(response)) {
            notification.success({});
            outerDataSet.query();
          }
        });
    },
    [formDs]
  );

  const fields = useMemo(
    () => [
      { name: 'itemCategoryLov', _type: 'Lov' },
      { name: 'attributeVarchar13', _type: 'TextField' },
      { name: 'attributeVarchar14', _type: 'TextField' },
      { name: 'uomNameLov', _type: 'Lov' },
      { name: 'itemModel', _type: 'TextField' },
      { name: 'attributeVarchar15', _type: 'TextField' },
      { name: 'attributeVarchar17', _type: 'TextField', show: ({ record }) => !record.get('categoryId') },
      { name: 'attributeVarchar17Lov', _type: 'Lov', show: ({ record }) => !!record.get('categoryId') },
      { name: 'itemSpecs', _type: 'TextField' },
      { name: 'attributeVarchar16', _type: 'TextField' },
      { name: 'itemName', _type: 'TextField' },
      { name: 'itemDesc', _type: 'TextField' },
    ].filter(Boolean),
    [formDs]
  );

  return (
    <>
      <FormPro dataSet={formDs} columns={3} fields={fields} />
    </>
  );
};

export default React.memo(
  formatterCollections({ code: [intlPrompt, 'hzero.common'] })(NewItemModal)
);
