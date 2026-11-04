// 询价单操作按钮
import React, { Component } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';

import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';
import notification from 'utils/notification';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { cuxSubmitBudgetEstimate } from '@/services/inquiryHallNewService';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import PreviewScoreManager from '@/routes/ssrc/components/PreviewScoreManager';

@observer
export default class OperateButtons extends Component {
  constructor(props) {
    super(props);
    props.onButtonsRef(this);

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

  // 预览分权
  previewScoreManager = () => {
    const { rfxId, organizationId } = this.props;

    const modalProps = {
      rfxId,
      organizationId,
    };

    Modal.open({
      key: Modal.key(),
      closable: true,
      destroyOnClose: true,
      title: intl.get('ssrc.inquiryHall.view.button.previewSeperatePower').d('预览分权'),
      style: { width: '800px' },
      children: <PreviewScoreManager {...modalProps} />,
      footer: false,
    });
  };

  // 概算提交
  submitBudgetEstimate = async () => {
    const {
      RfxInfoDS = {},
      rfxId = null,
      budgetEstimateSubmitConfirm,
      fetchInquiryHallUpdate,
    } = this.props;
    const { isLoading = false } = this.state;

    if (isLoading) {
      return;
    }

    const estimateFields = [
      'attributeDecimal10',
      'attributeDecimal11',
      'attributeLongtext18',
      'attributeLongtext23',
    ];
    const emptyFields = estimateFields.filter((name) => {
      const value = RfxInfoDS?.current?.get(name);
      return isNil(value) || (typeof value === 'string' && !value.trim());
    });

    if (emptyFields.length) {
      notification.warning({
        message: intl
          .get('scux.ssrc.view.message.button.twnf.budgetEstimateIncomplete')
          .d('基础信息的概算信息不完整，请维护后再提交'),
      });
      return;
    }

    this.toggleButtonLoading(true);
    try {
      const res = getResponse(await cuxSubmitBudgetEstimate({ rfxHeaderId: rfxId }));
      // getResponse 已处理 failed 的报错，这里只需处理业务校验未通过的情况
      if (!res) {
        return;
      }
      if (res.passFlag === false) {
        Modal.confirm({
          key: Modal.key(),
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: res.message || intl.get('hzero.common.status.mistake').d('错误'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          onOk: () => budgetEstimateSubmitConfirm?.(),
        });
        return;
      }
      notification.success();
      // 接口校验通过，刷新页面数据
      if (fetchInquiryHallUpdate) {
        fetchInquiryHallUpdate();
      }
    } catch (error) {
      const description =
        error?.response?.data?.message ||
        error?.message ||
        intl.get('hzero.common.status.mistake').d('错误');
      notification.error({
        message: intl.get('hzero.common.status.mistake').d('错误'),
        description,
      });
    } finally {
      this.toggleButtonLoading(false);
    }
  };

  getButtons = () => {
    const {
      rfxId = null,
      RfxInfoDS = {},
      releaseInquiryHall,
      saveInquiryHallUpdate,
      cancelInquiryHallUpdate,
      inquiryHallLoading = false,
      remote,
      bidFlag = false,
      integrationPageData = () => {},
      organizationId,
      supplierListTableDS,
      itemLineTableDS,
      rfx = {},
    } = this.props;
    const { isLoading = false } = this.state;

    const NewRFXFlag = rfxId && rfxId !== 'null';
    const TemplateFlag = RfxInfoDS.current.get('templateId');

    const { sourceKey } = rfx;

    const buttons = [
      {
        name: 'scoreElementsExport',
        hidden: !NewRFXFlag, // 新建询价单状态不显示评分要素导出按钮
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SRM_C_STANDARD_SSRC_EVALUATE_INDIC_EXPORT',
          name: 'scoreElementsExport',
          requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/evaluate-indics/export`,
          method: 'GET',
          buttonText: intl
            .get('ssrc.inquiryHall.view.button.export.scoreElements')
            .d('评分要素导出'),
          queryParams: {
            sourceHeaderId: rfxId,
            indicStatus: 'SUBMITTED',
            indicateLevel: 'ONE',
            sourceFrom: 'RFX',
            organizationId: getCurrentOrganizationId(),
            customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS,SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN_V2`,
          },
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
          },
        },
      },
      NewRFXFlag && {
        name: 'preview',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'report_overview',
          funcType: 'flat',
          wait: 500,
          waitType: 'debounce',
          loading: isLoading,
          disabled: inquiryHallLoading,
          onClick: this.previewScoreManager,
        },
        child: intl.get('ssrc.inquiryHall.view.button.previewSeperatePower').d('预览分权'),
      },
      NewRFXFlag && {
        name: 'cancel',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'cancel',
          funcType: 'flat',
          wait: 500,
          waitType: 'debounce',
          loading: isLoading || inquiryHallLoading,
          onClick: cancelInquiryHallUpdate,
        },
        child: intl.get('hzero.common.button.cancel').d('取消'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnComp: TooltipButtonPro,
        btnProps: {
          icon: 'save',
          help: intl.get('ssrc.common.view.message.source-template.save.tip').d('请先维护寻源模板'),
          funcType: NewRFXFlag ? 'flat' : 'raised',
          // wait: 500,
          // waitType: 'debounce',
          loading: isLoading || inquiryHallLoading,
          onClick: saveInquiryHallUpdate,
          disabled: !TemplateFlag,
          color: !NewRFXFlag && 'primary',
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      NewRFXFlag && {
        name: 'submit',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'publish2',
          color: 'primary',
          loading: isLoading || inquiryHallLoading,
          onClick: this.submitBudgetEstimate,
        },
        child: intl.get('scux.ssrc.view.message.button.twnf.budgetEstimateSubmit').d('概算提交'),
      },
      NewRFXFlag && {
        name: 'release',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'publish2',
          color: 'primary',
          // wait: 500,
          // waitType: 'debounce',
          loading: isLoading || inquiryHallLoading,
          onClick: releaseInquiryHall,
          disabled: RfxInfoDS && RfxInfoDS.current && !TemplateFlag,
        },
        child: intl.get('hzero.common.button.release').d('发布'),
      },
    ].filter(Boolean);
    return remote
      ? remote.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_HEADER_BUTTONS', buttons, {
          bidFlag,
          NewRFXFlag,
          RfxInfoDS,
          integrationPageData,
          organizationId,
          toggleButtonLoading: this.toggleButtonLoading,
          isLoading,
          current: this,
          rfxId,
          supplierListTableDS,
          itemLineTableDS,
        })
      : buttons;
  };

  render() {
    const { RfxInfoDS = {}, customizeBtnGroup = () => {}, rfx = {} } = this.props;
    const { sourceKey } = rfx;

    if (!RfxInfoDS || !RfxInfoDS.current) {
      return null;
    }

    return (
      <React.Fragment>
        {customizeBtnGroup(
          { code: `SSRC.${sourceKey}_HALL.NEW_EDIT.BUTTON_GROUP`, pro: true },
          <DynamicButtons buttons={this.getButtons()} />
        )}
      </React.Fragment>
    );
  }
}
