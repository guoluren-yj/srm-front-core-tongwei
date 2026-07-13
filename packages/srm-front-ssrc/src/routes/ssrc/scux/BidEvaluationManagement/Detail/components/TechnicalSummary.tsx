import React, { useEffect, useState } from "react";
import { Form, Button, useDataSet, Select, Attachment, TextArea } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { techSummaryDataSet } from '../store/storeDS';

const TechnicalSummary = (props) => {
  const { modal, listDS, evaluateSummaryId } = props;

  const techSummaryDS = useDataSet(() => techSummaryDataSet({ evaluateSummaryId }), [evaluateSummaryId]);

  const [btnLoading, setBtnLoading] = useState(false);

  const handleSaveOrSubmitTechSummary = async (type) => {
    const validateRes = await techSummaryDS.validate();
    if (!validateRes) {
      notification.warning({
        message: intl.get('scux.bidEvaluationManagement.view.tip.validateTechSumPageMessage').d('校验不通过，请检查页面数据！'),
      });
      return false;
    };
    try {
      setBtnLoading(true);
      techSummaryDS.setQueryParameter('postType', type);
      const submitRes = await techSummaryDS.submit();
      if (submitRes && !submitRes.failed) {
        if (type === 'SAVE') {
          await techSummaryDS.query();
        };
        if (type === 'SUBMIT' && modal) {
          if (listDS) {
            listDS.query();
          };
          modal.close();
        };
        setBtnLoading(false);
        return false;
      };
      setBtnLoading(false);
    } catch (error) {
      setBtnLoading(false);
      throw error;
    };
  };

  useEffect(() => {
    if (modal) {
      modal.update({
        footer: () => (
          <>
            <Button loading={btnLoading} wait={1000} onClick={() => handleSaveOrSubmitTechSummary('SAVE')}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button loading={btnLoading} wait={1000} color={ButtonColor.primary} onClick={() => handleSaveOrSubmitTechSummary('SUBMIT')}>
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
          </>
        ),
      });
    };
  }, [modal]);

  return (
    <Form dataSet={techSummaryDS} labelLayout={LabelLayout.float} columns={2}>
      <Select name="invalidFlag" />
      <Attachment name="attributeLongtext1" />
      <TextArea name="invalidReason" colSpan={2} />
    </Form>
  );
};

export default TechnicalSummary;
