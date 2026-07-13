import React from 'react';
import { Button, Modal } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import EditorOnline from './EditorOnline';

// onlyOffice online edit
const OnlyOfficeEditorOnline = (props) => {
  // pageType等于【template】取fileTemplateId，pageType等于【attachLine】取attachmentLineId
  const { title = '', modalTitle = '', buttonProps, ...others } = props;

  const getOnLineDOcComponent = () => {
    Modal.open({
      key: Modal.key(),
      fullScreen: true,
      destroyOnClose: true,
      closable: true,
      bodyStyle: {
        padding: '0px',
        margin: '0px',
      },
      title:
        modalTitle || intl.get('ssrc.fileTemplateManage.view.title.templateDesign').d('模板设计'),
      children: <EditorOnline {...others} />,
      footer: null,
    });
  };
  return (
    <Button funcType="link" onClick={getOnLineDOcComponent} {...(buttonProps || {})}>
      {title || intl.get('ssrc.fileTemplateManage.view.button.templateDesigned').d('模板设计')}
    </Button>
  );
};

export default formatterCollections(['ssrc.fileTemplateManage'])(OnlyOfficeEditorOnline);
