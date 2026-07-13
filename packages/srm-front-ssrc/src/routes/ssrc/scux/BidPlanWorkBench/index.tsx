import React, { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs, Steps } from 'choerodon-ui';
import { Button, Modal, Form, DataSet, Lov } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { isEmpty, isNil, omit } from 'lodash';
import querystring from 'querystring';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import withProps from 'utils/withProps';

import PurchaseRequestContent from '@/routes/ssrc/ProjectSetupNew/PurchaseRequestContent';
import PurchaseRequestDS from '@/routes/ssrc/ProjectSetupNew/PurchaseRequestDS';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { isText, applyToNotification } from '@/utils/utils';
import { newBatchValidatePurchase } from '@/services/inquiryHallService';
import { createQuoteApproval, createProjectToinquiry } from '@/services/projectSetupService';
import { getPromptMessage } from '@/routes/components/ConfirmModal';
import SectionDrawer from '@/routes/ssrc/ProjectSetupNew/SectionDrawer';
import { SectionLineDS } from '@/routes/ssrc/ProjectSetupNew/SectionLineDS';

import { tableDataSet, sourcingTemplateDS } from './storeDs';
import { timeFilerProcess } from '../utils/fun';

const { TabPane } = Tabs;
const { Step } = Steps;

// 步骤条tag对应的颜色集
const statusTagColorMap = {
  NEW: 'process', // 新建
  CANCEL: 'wait', // 已取消
  APPROVING: 'process', // 审批中
  REFUSE: 'error', // 审批拒绝
  SOURCE_PREPARATION: 'process', // 招标准备
  APPROVED: 'process', // 待寻源
  CHANGING: 'process', // 变更中
  CHANGE_APPROVING: 'process', // 变更审批中
  SOURCING: 'process', // 寻源中
  FINISHED: 'finish', // 完成
  CHANGE_REFUSE: 'error', // 变更审批拒绝
  SUSPENT_APPROVALING: 'process', // 中止审批中
};

const Index: React.FC<any> = (props) => {

  const {
    history,
    allDs,
    toBeReleasedDs,
  } = props;

  const [activeKey, setActiveKey] = useState('toBeReleased');
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false);

  useEffect(() => {
    queryDoubleUnit();
    handleQueryTabData();
  }, []);

  const getCurrentTableDs = () => {
    if (activeKey === 'toBeReleased') {
      return toBeReleasedDs;
    }
    return allDs;
  };

  // 编辑、变更
  const handleEdit = (record) => {
    const sourceProjectId = record.get('sourceProjectId');
    if (!sourceProjectId) return;
    history.push({
      pathname: `/scux/ssrc/bid-plan-workbench/bp-update/${sourceProjectId}`,
    });
  };

  // 新建寻源 - 选择模板
  const handleOkChooseTemplate = async ({ sourcingTemplateDs, sectionLineDS, record, sectionModal }) => {
    const validateFlag = await sourcingTemplateDs.validate();
    if (!validateFlag) {
      return false;
    };
    const { templateId } = sourcingTemplateDs.current.get(['templateId']) || {};
    const params = {
      ...record.toData(),
      templateId: templateId?.templateId,
      organizationId: getCurrentOrganizationId(),
      projectLineSections: sectionLineDS.selected.map((r) => {
        const projectLineItemList = r.get('projectLineItemList');
        return {
          ...r.toData(),
          projectLineItemList: (projectLineItemList || []).filter((item) => item.projectLineItemId),
        };
      }),
    };
    const result = getResponse(await createProjectToinquiry(params));
    if (result) {
      const { rfxHeaderId } = result;
      history.push({
        pathname: `/ssrc/new-bid-hall/bid-update/${rfxHeaderId}`,
      });
      sectionModal.close();
      allDs.query(allDs.currentPage || 0); // 刷新列表
      return true;
    };
    return false;
  };

  // 打开模板选择弹框
  const openTemplateModal = ({ record, sectionLineDS, sectionModal }) => {
    if (!sectionLineDS.selected.length) {
      notification.warning({
        message: intl
          .get(`scux.bidPlanWorkBench.view.message.validation.selectSections`)
          .d('请选择一条或者多条标段后操作！'),
      });
      return false;
    };

    const sourcingTemplateDs = new DataSet(sourcingTemplateDS(record));
    Modal.open({
      key: Modal.key(),
      title: intl.get(`scux.bidPlanWorkBench.view.message.title.chooseRfxTemplate`).d('选择寻源模板'),
      closable: true,
      drawer: true,
      style: { width: '350px' },
      onOk: () => handleOkChooseTemplate({ sourcingTemplateDs, sectionLineDS, record, sectionModal }),
      children: (
        <Form dataSet={sourcingTemplateDs} columns={1} labelLayout={LabelLayout.float}>
          <Lov name="templateId" />
        </Form>
      ),
      onCancel: () => sourcingTemplateDs.reset(),
    });
    return false;
  };

  // 新建寻源
  const handleAddInquiry = (record) => {
    const sourceProjectId = record.get('sourceProjectId');
    const drawerProps = {
      sourceProjectId,
      // @ts-ignore
      sectionLineDS: new DataSet(SectionLineDS(sourceProjectId)),
    };
    const sectionModal = Modal.open({
      key: Modal.key(),
      title: intl.get(`scux.bidPlanWorkBench.view.message.title.chooseSection`).d('选择标段'),
      closable: true,
      drawer: true,
      style: { width: '65%' },
      children: <SectionDrawer {...drawerProps} />,
      onOk: () => openTemplateModal({ record, sectionLineDS: drawerProps.sectionLineDS, sectionModal }),
    });
  };

  // 寻源结果
  const handleInquiryResult = () => {
    history.push({
      pathname: '/ssrc/new-bid-hall/list',
      search: querystring.stringify({
        tabStatus: 'all',
      }),
    });
  };

  // 列表按钮
  const getListButtons = ({ record }) => {
    const sourceProjectStatus = record.get('attributeVarchar13');
    const commonButtonsProps = {
      funcType: FuncType.link,
      wait: 500,
    }
    return [
      ['NEW', 'REFUSE'].includes(sourceProjectStatus) && (
        <Button {...commonButtonsProps} onClick={() => handleEdit(record)}>
          {intl.get('scux.bidPlanWorkBench.view.button.edit').d('编辑')}
        </Button>
      ),
      ['SOURCE_PREPARATION', 'CHANGE_REFUSE', 'CHANGING'].includes(sourceProjectStatus) && (
        <Button {...commonButtonsProps} onClick={() => handleEdit(record)}>
          {intl.get('scux.bidPlanWorkBench.view.button.edit').d('变更')}
        </Button>
      ),
      sourceProjectStatus === 'APPROVED' && (
        <Button {...commonButtonsProps} onClick={() => handleAddInquiry(record)}>
          {intl.get('scux.bidPlanWorkBench.view.button.addInquiry').d('新建寻源')}
        </Button>
      ),
      sourceProjectStatus === 'FINISHED' && (
        <Button {...commonButtonsProps} onClick={() => handleInquiryResult()}>
          {intl.get('scux.bidPlanWorkBench.view.button.inquiryResult').d('寻源结果')}
        </Button>
      ),
    ].filter(Boolean);
  };

  // 跳转明细页面
  const handleJumpDetail = (record) => {
    if (!record) return;
    const { sourceProjectId, rfxHeaderId } = record.get(['sourceProjectId', 'rfxHeaderId']);
    if (!sourceProjectId) return;
    history.push({
      pathname: `/scux/ssrc/bid-plan-workbench/bid-full-process-detail/${sourceProjectId}/${rfxHeaderId || -1}`,
    });
  };

  // 渲染状态
  const statusMeaningRender = (text) => {
    const style = { display: 'inline-flex' };
    return <span style={style}>{text}</span>;
  };

  // 状态步骤条渲染
  const statusRender = ({ record, value, text }) => {
    const flowLinks = record.get('flowLinks');
    return (
      <Steps
        type="popup"
        headerText={statusMeaningRender(text)}
        status={statusTagColorMap[value] || 'process'}
      >
        {flowLinks &&
          flowLinks.length &&
          flowLinks.map((item) => {
            if (item.nodeFlag === -1) {
              return <Step status="finish" title={item.nodeStatusMeaning} />;
            } else if (item.nodeFlag === 0) {
              return <Step status="process" title={item.nodeStatusMeaning} />;
            } else {
              return <Step  status="wait" title={item.nodeStatusMeaning} />;
            }
          })}
      </Steps>
    );
  };

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'attributeVarchar13',
        renderer: ({ record, value, text }) => statusRender({ record, value, text }),
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operator',
        renderer: ({ record }) => getListButtons({ record }),
      },
      {
        name: 'sourceProjectNum',
        renderer: ({ value, record }) => {
          return (
            <a onClick={() => handleJumpDetail(record)}>
              {value}
            </a>
          );
        },
      },
      {
        name: 'sourceProjectName',
      },
      {
        name: 'attributeVarchar18'
      },
      {
        name: 'companyName',
      },
      {
        name: 'attributeVarchar15Meaning',
      },
      {
        name: 'createdByName'
      },
      {
        name: 'creationDate',
      },
    ];
  }, [activeKey]);

  // 查询双单位是否开启
  const queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      setDoubleUnitFlag(!!Number(res));
    }
  };

  // 只在第一次的时候查询，主要是为了获取count
  const handleQueryTabData = () => {
    allDs.query();
    toBeReleasedDs.query();
  };

  // 招标计划新建-选择模板确认事件
  const handleSelectTemplateOk = async ({ selectedList, templateId }) => {
    const selectedRowKeys = selectedList.map(r => r.get('prLineId'));
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    }
    const res = await newBatchValidatePurchase({
      organizationId: getCurrentOrganizationId(),
      prLineIdList: selectedRowKeys,
      customizeUnitCode: 'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT_NEW.LIST',
      configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
      sourceDocumentType: 'PROJECT',
    });
    if (getResponse(res)) {
      const onOk = () => {
        if (res.secondaryUomInconsistentFlag === 1) {
          applyToNotification(res.secondaryUomInconsistentMes);
        }
        return createQuoteApproval({
          organizationId: getCurrentOrganizationId(),
          prLineIdList: selectedRowKeys,
          attributeVarchar10: templateId,
          attributeBigint10: 1,
        }).then((response) => {
          if (getResponse(response)) {
            notification.success({});
            const { sourceProject = {} } = response;
            const { sourceProjectId = '' } = sourceProject;
            if (!sourceProjectId) {
              return;
            }
            history.push({
              pathname: `/scux/ssrc/bid-plan-workbench/bp-update/${sourceProjectId}`,
            });
          } else {
            return false;
          }
        });
      };
      if (res === true || isEmpty(res)) {
        return onOk();
      }
      if (res && !isNil(res?.highestValidatorType) && res?.highestValidatorType !== 'SUCCESS') {
        switch (res?.highestValidatorType) {
          case 'WARNING':
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: getPromptMessage({ response: res, validatorArrName: 'validateResults' }),
              onOk: () => onOk(),
              bodyStyle: { maxHeight: 'calc(100vh - 2.5rem)' },
            });
            break;
          case 'ERROR':
            notification.error({
              message: intl.get('hzero.common.message.confirm.title').d('提示'),
              description: getPromptMessage({ response: res, validatorArrName: 'validateResults' }),
            });
            break;
          default:
            Modal.info({
              children: getPromptMessage({ response: res, validatorArrName: 'validateResults' }),
              bodyStyle: { maxHeight: 'calc(100vh - 2.5rem)' },
            });
            break;
        }
      }
      // 代表有错误内容，阻断弹窗关闭
      if (res?.returnDetail) {
        return false;
      }

      if (!res?.returnDetail) {
        // 校验不通过， 后端返回returnDetail对象
        return onOk();
      }
    } else {
      return false;
    }
  }

  // 引用申请转招标计划确认事件处理
  const handlePurchaseRequestOk = async ({ selectedList }) => {
    const formDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'templateId',
          label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingTemplate').d('寻源模板'),
          lovCode: 'SSRC.TEMPLATE_NAME',
          type: FieldType.object,
          required: true,
          transformRequest: (value) => value ? value.templateId : null,
          lovPara: {
            sourceCategory: 'RFX',
            secondarySourceCategory: 'NEW_BID',
          },
        }
      ]
    });
    await Modal.open({
      destroyOnClose: true,
      title: intl.get('scux.bidPlanWorkBench.view.title.modal.selectTemplate').d('选择模板'),
      children: (
        <Form dataSet={formDs} labelLayout={LabelLayout.float} columns={1}>
          <Lov name="templateId" />
        </Form>
      ),
      onOk: async () => {
        if (await formDs.validate()) {
          const templateId = formDs.current?.get('templateId')?.templateId;
          if (!templateId) {
            return false;
          }
          return handleSelectTemplateOk({ selectedList, templateId });
        }
      },
    });
  }


  // 引用申请转招标计划
  const handleQuoteBidPlan = () => {
    const purchaseRequestDs = new DataSet(PurchaseRequestDS() as any);
    purchaseRequestDs.setState('doubleUnitFlag', doubleUnitFlag);
    purchaseRequestDs.setState('cuxExtraParams', {
      attributeVarchar12: 'bidding',
    });
    const Props = {
      organizationId: getCurrentOrganizationId(),
      PurchaseRequestDS: purchaseRequestDs,
      doubleUnitFlag,
      executionLinkFlag: 1,
      history,
    };
    Modal.open({
      destroyOnClose: true,
      key: Modal.key(),
      drawer: true,
      title: intl.get('scux.bidPlanWorkBench.view.title.modal.quoteBidPlan').d('引用申请转招标计划'),
      children: <PurchaseRequestContent {...Props} />,
      style: { width: 1090 },
      onOk: () => {
        if (!purchaseRequestDs.selected.length) {
          notification.warning({
            message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
          });
          return false;
        };
        return handlePurchaseRequestOk({ selectedList: purchaseRequestDs.selected });
      },
      onClose: () => {
        purchaseRequestDs.clearCachedSelected();
        purchaseRequestDs.unSelectAll();
      },
    });
  }


  // 获取tab展示标识
  const tabs = useMemo(() => {
    return [
      {
        key: 'toBeReleased',
        title: intl.get('scux.bidPlanWorkBench.view.tab.title.toBeReleased').d('待发布'),
        ds: toBeReleasedDs,
        component: (
          <FilterBarTable
            columns={columns}
            dataSet={toBeReleasedDs}
            border={false}
            cacheState
            filterBarConfig={{
              cacheKey: 'bidPlanWorkbenchUnReleasedList',
              autoQuery: false,
              left: {
                render: (ds) => {
                  if (ds && (!ds.getField('multiProjectNumOrTitle') || !ds.getField('multiProjectNumOrTitle')?.get('transformRequest'))) {
                    ds.addField('multiProjectNumOrTitle', {
                      transformRequest: (value) => {
                        if (value) {
                          return value.join(',');
                        }
                        return '';
                      },
                    });
                  };
                  return (
                    <MultipleTextSplitInput
                      name="multiProjectNumOrTitle"
                      dataSet={ds}
                      placeholder={intl
                        .get('scux.bidPlanWorkBench.view.placeholder.itemNumAndNum')
                        .d('招标计划单号，招标计划名称')}
                      style={{ width: '3rem' }}
                    />
                  );
                },
              },
            }}
            customizable
            customizedCode="SCUX_TWNF_BID_PLAN_WORK_BENCH_TO_BE_RELEASED_LIST"
            style={{ maxHeight: 'calc(100vh - 260px)' }}
          />
        )
      },
      {
        key: 'all',
        title: intl.get('scux.bidPlanWorkBench.view.tab.title.all').d('全部'),
        ds: allDs,
        component: (
          <FilterBarTable
            columns={columns}
            dataSet={allDs}
            border={false}
            cacheState
            filterBarConfig={{
              cacheKey: 'bidPlanWorkbenchAllList',
              autoQuery: false,
              left: {
                render: (ds) => {
                  if (ds && (!ds.getField('multiProjectNumOrTitle') || !ds.getField('multiProjectNumOrTitle')?.get('transformRequest'))) {
                    ds.addField('multiProjectNumOrTitle', {
                      transformRequest: (value) => {
                        if (value) {
                          return value.join(',');
                        }
                        return '';
                      },
                    });
                  };
                  return (
                    <MultipleTextSplitInput
                      name="multiProjectNumOrTitle"
                      dataSet={ds}
                      placeholder={intl
                        .get('scux.bidPlanWorkBench.view.placeholder.itemNumAndNum')
                        .d('招标计划单号，招标计划名称')}
                        style={{ width: '3rem' }}
                    />
                  );
                },
              }
            }}
            customizable
            customizedCode="SCUX_TWNF_BID_PLAN_WORK_BENCH_ALL_LIST"
            style={{ maxHeight: 'calc(100vh - 260px)' }}
          />
        ),
      },
    ];
  }, []);

  // 导出
  const handleExportProps = useMemo(() => {
    const ds = getCurrentTableDs();
    const queryData = omit((ds?.queryDataSet?.current?.toData() || {}), ['__id', '_status', '__dirty'])
    return {
      templateCode: 'CUS.TWNF_BID_PLAN_EXPORT',
      name: 'exportProject',
      requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/source-projects/export-sourceProject`,
      buttonText: intl.get('hzero.common.button.export').d('导出'),
      queryParams: () => ({
        ...timeFilerProcess(queryData, [{
          name: 'creationDate_range',
          startName: 'creationDateFrom',
          endName: 'creationDateTo',
        }]),
        customSql: 'cuxBidPlan',
        noneSourceProjectIds: (ds.selected || []).map(record => record.get('sourceProjectId')).join(','),
      }),
      otherButtonProps: {
        funcType: 'flat',
      },
    };
  }, [activeKey, getCurrentTableDs]);

  // 切换tab
  const handleChangeTab = (key) => {
    setActiveKey(key);
  };

  return (
    <>
      <Header title={intl.get('scux.bidPlanWorkBench.view.title.list.bidPlanWorkBench').d('招标计划工作台')}>
        <Button icon="add" onClick={handleQuoteBidPlan}>
          {intl.get('scux.bidPlanWorkBench.view.button.addBidPlan').d('招标计划')}
        </Button>
        <ExcelExportPro {...handleExportProps} />
      </Header>
      <Content>
        <Tabs activeKey={activeKey} onChange={handleChangeTab}>
          {tabs.map(tab => (
            <TabPane
              key={tab.key}
              tab={tab.title}
              count={tab.ds.totalCount}
            >
              {tab.component}
            </TabPane>
          ))}
        </Tabs>
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidPlanWorkBench']
})(withProps(() => ({
  // 待发布
  toBeReleasedDs: new DataSet(tableDataSet({ tab: 'toBeReleased' })),
  // 全部
  allDs: new DataSet(tableDataSet({ tab: 'all' })),
}), {
  cacheState: true,
  cleanWhenClose: false,
  keepOriginDataSet: true,
})(observer(Index)));
