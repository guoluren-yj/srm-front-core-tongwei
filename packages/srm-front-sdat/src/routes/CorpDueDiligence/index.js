import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { compose } from 'lodash';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button } from 'choerodon-ui/pro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { getEnvConfig } from 'utils/iocUtils';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import { getResponse, getLocalUrlParam } from '@/utils/utils';

import { fetchGetPdfUrl, fetchExportPdf } from './stores/corporateDiligenceDS';
import LeftMenu from './LeftMenu';
import DynamicCardPanel from './DynamicCardPanel';

import styles from './index.less';

const { HZERO_FILE } = getEnvConfig();

const CorpDue = props => {
  const { customizeTable } = props;

  const [selected, setSelected] = useState(null);
  const [defaultCompany, setDefaultCompany] = useState('');

  const handleExportPdf = async () => {
    if (!(selected && selected.recordId)) return;
    const res = await fetchExportPdf({ recordId: selected.recordId });
    if (getResponse(res) && res.fileUrl) {
      const a = document.createElement('a');
      a.href = res.fileUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    const { companyName = '' } = getLocalUrlParam() || {};
    setDefaultCompany(companyName);
  }, []);

  const handleSelectItem = item => {
    setSelected(item);
  };

  const handlePreview = async () => {
    const id = selected?.recordId ?? '';
    if (id) {
      const res = await fetchGetPdfUrl({ recordId: id });
      if (getResponse(res)) {
        const url = res?.fileUrl ?? '';
        window.open(
          `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url?url=${url}&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
        );
      }
    }
  };

  return (
    <>
      <Header
        title={intl
          .get('sdat.corporateDiligence.view.title.corporateDueDiligence')
          .d('企业尽职调查报告')}
      >
        <Button funcType="flat" icon="visibility-o" onClick={handlePreview}>
          {intl.get('sdat.corporateDiligence.view.title.preViewReport').d('预览报告')}
        </Button>
        <Button funcType="flat" icon="file_download_black-o" onClick={handleExportPdf}>
          {intl.get('sdat.corporateDiligence.view.button.reportExport').d('报告下载')}
        </Button>
      </Header>
      <div className={styles['corp-due-diligence-basic']}>
        <LeftMenu onSelect={handleSelectItem} defaultCompany={defaultCompany} />
        <DynamicCardPanel record={selected} customizeTable={customizeTable} />
      </div>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['sdat.corporateDiligence', 'sdat.riskProfile'],
  }),
  WithCustomizeC7N({
    unitCode: ['SDAT.CORPORATE_DILIGENCE_TABLE_GROUP', 'SDAT.CORPORATE_DILIGENCE_TABLE_SHELL'],
  })
)(CorpDue);
