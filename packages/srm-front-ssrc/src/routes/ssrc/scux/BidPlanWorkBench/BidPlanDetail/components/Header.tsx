import React, { useMemo } from "react";
import { Button, Modal, DataSet, Form, TextArea, Attachment, Lov } from 'choerodon-ui/pro';
import { ButtonColor } from "choerodon-ui/pro/lib/button/enum";
import { FieldType } from "choerodon-ui/pro/lib/data-set/enum";
import { LabelLayout } from "choerodon-ui/pro/lib/form/enum";
import { isEqual } from 'lodash';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import {
  saveOrSubmitPageData,
  stopSubmitPageData,
  changeSaveOrSubmitPageData,
} from '../../api';
import { useStore } from '../store/StoreProvider';

const PageHeader: React.FC<any> = () => {
  const {
    commonDs: {
      baseInfoDs,
      bidPlanNodeDs,
    } = {},
    editorFlag,
    changeFlag,
    initData = () => {},
    pageLoading,
    setPageLoading = () => {},
    sourceProjectId,
    history,
  } = useStore();

  // 校验页面数据
  const validatePageData = async () => {
    if (!baseInfoDs || !bidPlanNodeDs) {
      return Promise.reject(new Error('Data sets are not initialized'));
    };

    const validateRes = await Promise.all([
      baseInfoDs.validate(),
      bidPlanNodeDs.validate(),
    ]);
    if (validateRes.some((item) => !item)) return false;
    return true;
  };

  // 获取变更节点列表数据
  const getChangeNodeListData = () => {
    if (!bidPlanNodeDs || !bidPlanNodeDs.records?.length) {
      return [];
    }
    return bidPlanNodeDs?.records.map(r => {
      let updateFlag = 0;
      ['userInCharge', 'planFinishDate', 'remark'].forEach(n => {
        if (n === 'userInCharge') {
          const newValueIds = (r.get(n) || []).map(i => i.userId);
          const pristineValueIds = (r.getPristineValue(n) || []).map(i => i.userId);
          if (newValueIds.length !== pristineValueIds.length || !isEqual(newValueIds, pristineValueIds)) {
            updateFlag = 1;
            return true;
          };
        } else {
          if (r.get(n) !== r.getPristineValue(n)) {
            updateFlag = 1;
            return true;
          };
        };
      })
      return {
        ...r.toData(),
        updateFlag,
      };
    })
  };

  // 获取页面数据
  const getPageData = async () => {
    if (!await validatePageData()) {
      notification.error({
        message: intl.get('scux.bidPlanDetail.view.tip.validatePageMessage').d('校验不通过，请检查页面数据！'),
      });
      return;
    };
    return {
      sourceProject: {
        ...(baseInfoDs?.current?.toData() || {}),
        bidNodeList: changeFlag ? getChangeNodeListData() : bidPlanNodeDs?.toData(),
      },
    };
  };

  // 保存
  const handleSave = async () => {
    setPageLoading(true);
    const pageData = await getPageData();
    if (!pageData) {
      setPageLoading(false);
      return;
    };
    const savePageData = changeFlag ? changeSaveOrSubmitPageData : saveOrSubmitPageData;
    return savePageData({
      ...pageData,
      query: {
        postType: 'SAVE',
      },
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        initData();
      } else {
        setPageLoading(false);
      }
    });
  };

  // 提交
  const handleSubmit = async () => {
    setPageLoading(true);
    const pageData = await getPageData();
    if (!pageData) {
      setPageLoading(false);
      return;
    };
    const submitPageData = changeFlag ? changeSaveOrSubmitPageData : saveOrSubmitPageData;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: <div>{intl.get('scux.bidPlanDetail.view.tip.submitMessage').d('确认要提交招标计划单吗？')}</div>,
      onOk: () => {
        return submitPageData({
          ...pageData,
          query: {
            postType: 'SUBMIT',
          },
        }).then(res => {
          if (getResponse(res)) {
            notification.success({});
            history.push('/scux/ssrc/bid-plan-workbench/list');
          };
        }).finally(() => {
          setPageLoading(false);
        });
      },
      onCancel: () => {
        setPageLoading(false);
      },
    });
  };

  // 中止提交
  const handleStopSubmit = () => {
    const formDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'attributeLongtext11',
          label: intl.get('scux.bidPlanDetail.view.model.stopBidReason').d('中止招标原因'),
          type: FieldType.string,
          required: true,
        },
        {
          name: 'attributeVarchar14',
          label: intl.get('scux.bidPlanDetail.view.model.approvalPerson').d('审批人'),
          type: FieldType.object,
          required: true,
          lovCode: 'HIAM.TENANT.ACCOUNT',
          transformRequest: (value) => value ? value.userId : null,
        },
        {
          name: 'attributeLongtext10',
          label: intl.get('scux.bidPlanDetail.view.model.stopAttachment').d('中止附件'),
          type: FieldType.attachment,
          required: true,
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'ssrc-bid-projectsetup',
        },
      ],
    });
    Modal.open({
      title: intl.get('scux.bidPlanDetail.view.title.modal.stopBidding').d('中止招标'),
      children: (
        <Form dataSet={formDs} columns={1} labelLayout={LabelLayout.float}>
          <TextArea name="attributeLongtext11" />
          <Lov name="attributeVarchar14" />
          <Attachment name="attributeLongtext10" />
        </Form>
      ),
      onOk: async () => {
        if (!await formDs.validate()) {
          return false;
        };
        const stopFormData = formDs.toData()[0];

        return stopSubmitPageData({
          sourceProjectId,
          ...(stopFormData || {}),
        }).then(res => {
          if (getResponse(res)) {
            notification.success({});
            history.push('/scux/ssrc/bid-plan-workbench/list');
          }
        });
      }
    })
  };

  // 撤销变更
  const handleCancelChange = async() => {
    setPageLoading(true);
    const pageData = await getPageData();
    if (!pageData) {
      setPageLoading(false);
      return;
    };
    return changeSaveOrSubmitPageData({
      ...pageData,
      query: {
        postType: 'REVOKE',
      },
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        history.push('/scux/ssrc/bid-plan-workbench/list');
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 标题
  const pageTitle = useMemo(() => {
    if (editorFlag) {
      return intl.get('scux.bidPlanDetail.view.title.page.create').d('招标计划维护');
    }
    if (changeFlag) {
      return intl.get('scux.bidPlanDetail.view.title.page.change').d('招标计划变更');
    };
    return intl.get('scux.bidPlanDetail.view.title.page.detail').d('招标计划明细')
  }, [editorFlag, changeFlag]);

  return (
    <Header
      title={pageTitle}
      backPath="/scux/ssrc/bid-plan-workbench/list"
    >
      {!editorFlag && !changeFlag ? [] : (
        <>
          <Button icon="check" wait={1000} color={ButtonColor.primary} onClick={handleSubmit} disabled={pageLoading}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button icon="save" wait={1000} onClick={handleSave} disabled={pageLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="not_interested" wait={1000} onClick={handleStopSubmit} disabled={pageLoading}>
            {intl.get('scux.bidPlanDetail.view.button.stopSubmit').d('中止提交')}
          </Button>
          {['CHANGING', 'CHANGE_APPROVING'].includes(baseInfoDs?.current?.get('attributeVarchar13')) && (
            <Button icon="" wait={1000} onClick={handleCancelChange} disabled={pageLoading}>
              {intl.get('scux.bidPlanDetail.view.button.cancelChange').d('撤销变更')}
            </Button>
          )}
        </>
      )}
    </Header>
  );
};

export default PageHeader;
