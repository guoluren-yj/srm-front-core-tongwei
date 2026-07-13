// 个性化定制操作按钮
import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import { isFunction, isEmpty } from 'lodash';

import ExcelExport from 'components/ExcelExport';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';
import Upload from 'srm-front-boot/lib/components/Upload';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

@observer
export default class OperateButtons extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onButtonsRef)) {
      props.onButtonsRef(this);
    }

    this.state = {
      isLoading: false, // 按钮操作
    };
  }

  // 切换loading status
  @Bind()
  toggleButtonLoading(isLoading = false) {
    this.setState({
      isLoading,
    });
  }

  @Bind()
  getQueryData(datas) {
    if (datas) {
      const data = Object.assign(datas);
      Object.keys(data).forEach((item) => {
        if (!data[item]) {
          delete data[item];
        }
      });
      return data;
    }
  }

  render() {
    const {
      tableDs,
      handleUpdate,
      handleSave,
      handleSubmit,
      handleDelete,
      handleImport,
      handleOperation,
      pathname,
      customizeBtnGroup = () => {},
      tabKey = '',
      attachmentUuid = '',
    } = this.props;
    const { isLoading = false } = this.state;
    const { selected } = tableDs;
    const params = tableDs.queryDataSet && this.getQueryData(tableDs.queryDataSet.toData()[0]);
    const disabledFlag = tabKey === 'details';
    const pathFlag = pathname.indexOf('create') === -1 && pathname.indexOf('update') === -1;
    return (
      <React.Fragment>
        {pathFlag
          ? customizeBtnGroup({ code: 'SCUX.CUSTOMIZE.MAINTAIN.BUTTON' }, [
              <Button
                data-name="create"
                onClick={handleUpdate}
                wait={500}
                waitType="debounce"
                loading={isLoading}
                disabled={disabledFlag}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>,

              <Button
                data-name="submit"
                color="primary"
                wait={500}
                waitType="debounce"
                loading={isLoading}
                disabled={isEmpty(selected) || disabledFlag}
                onClick={handleSubmit}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>,
              <Button
                data-name="save"
                onClick={handleSave}
                wait={500}
                waitType="debounce"
                loading={isLoading}
                disabled={disabledFlag}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <Button
                data-name="delete"
                onClick={handleDelete}
                wait={500}
                waitType="debounce"
                disabled={isEmpty(selected) || disabledFlag}
                loading={isLoading}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>,
              <Button
                data-name="import"
                disabled={disabledFlag}
                onClick={handleImport}
                wait={500}
                waitType="debounce"
              >
                {intl.get('hzero.common.view.button.import').d('导入')}
              </Button>,
              <ExcelExport
                data-name="export"
                buttonText={intl.get(`hzero.common.button.export`).d('导出')}
                otherButtonProps={{ icon: 'export' }}
                requestUrl={`${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/export`}
                queryParams={{ ...params }}
              />,
            ])
          : customizeBtnGroup({ code: 'SCUX.CUSTOMIZE.DETAIL.BUTTON' }, [
              <Button
                data-name="delete"
                onClick={handleDelete}
                wait={500}
                waitType="debounce"
                loading={isLoading}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>,
              <Button
                data-name="operation"
                onClick={handleOperation}
                wait={500}
                waitType="debounce"
              >
                {intl.get('hzero.common.view.button.operationRecord').d('操作记录')}
              </Button>,
              <Button>
                <Upload
                  data-name="operation"
                  filePreview
                  bucketName="private-bucket"
                  attachmentUUID={attachmentUuid}
                  tenantId={organizationId}
                  afterOpenUploadModal={(uuid) => {
                    tableDs.current.set('attachmentUuid', uuid);
                  }}
                />
              </Button>,
            ])}
      </React.Fragment>
    );
  }
}
