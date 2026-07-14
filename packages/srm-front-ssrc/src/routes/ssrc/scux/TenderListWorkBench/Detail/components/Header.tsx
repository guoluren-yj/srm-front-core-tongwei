import React, { useMemo } from "react";
import { Button } from 'choerodon-ui/pro';
import { ButtonColor } from "choerodon-ui/pro/lib/button/enum";

import { Header } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import OperationRecordCux from 'srm-front-boot/lib/components/OperationRecordCux';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';

import {
  tenderListBillCommonApi,
} from '../../api';
import { useStore } from '../store/StoreProvider';

// 操作记录icon
const statusIconTypes = [
  {
    value: 'CREATE',
    PUBLISHED: '新建',
    icon: 'add',
  },
  {
    value: 'SUBMIT',
    PUBLISHED: '提交',
    icon: 'check',
  },
];

const PageHeader: React.FC<any> = () => {
  const {
    commonDs: {
      baseInfoDs,
      tenderListSectionDs,
    } = {},
    editorFlag,
    initData = () => {},
    pageLoading,
    setPageLoading = () => {},
    bidCatalogId,
    history,
  } = useStore();

  // 校验页面数据
  const validatePageData = async () => {
    if (!baseInfoDs || !tenderListSectionDs) {
      return Promise.reject(new Error('Data sets are not initialized'));
    };

    const validateRes = await Promise.all([
      baseInfoDs.validate(),
      tenderListSectionDs.validate(),
    ]);
    if (validateRes.some((item) => !item)) return false;
    return true;
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
      catalogHeader: baseInfoDs?.current?.toData() || {},
      sectionList: tenderListSectionDs?.toData(),
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
    return tenderListBillCommonApi({
      operationType: 'SAVE_CATALOG',
      ...pageData,
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        initData();
      } else {
        setPageLoading(false);
      }
    });
  };

  // 确认
  const handleSubmit = async () => {
    setPageLoading(true);
    const pageData = await getPageData();
    if (!pageData) {
      setPageLoading(false);
      return;
    };
    return tenderListBillCommonApi({
      operationType: 'CONFIRM',
      ...pageData,
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        history.push('/scux/ssrc/tender-workbench/list');
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 删除
  const handleDelete = () => {
    setPageLoading(true);
    return tenderListBillCommonApi({
      operationType: 'DELETE_CATALOG',
      catalogHeader: baseInfoDs?.current?.toData() || {},
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        history.push('/scux/ssrc/tender-workbench/list');
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 操作记录
  const operationBtn = useMemo(() => [
    <OperationRecordCux
      method="POST"
      btnIcon=""
      btnType="button"
      modalContentType="tabs"
      tableUrl={`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/v8iakAicH6oqZZdRutibdBmeGpSic9wlxicU2YbsJ0UQiaBVM`}
      tableOtherParams={{
        postType: "ACTION",
        sourceId: bidCatalogId,
        actionType: "BID_CATALOG",
      }}
      operateTransportParams={{
        method: "POST",
      }}
      statusIconTypes={statusIconTypes}
    />,
  ], [bidCatalogId]);

  // 标题
  const pageTitle = useMemo(() => {
    if (editorFlag) {
      return intl.get('scux.tenderDetail.view.title.page.create').d('招表单清单维护');
    };
    return intl.get('scux.tenderDetail.view.title.page.detail').d('招表单清详情');
  }, []);

  return (
    <Header
      title={pageTitle}
      backPath="/scux/ssrc/tender-workbench/list"
    >
      {editorFlag ? (
        <>
          <Button icon="check" wait={1000} color={ButtonColor.primary} onClick={handleSubmit} disabled={pageLoading}>
            {intl.get('hzero.common.view.button.confirm').d('确认')}
          </Button>
          <Button icon="save" wait={1000} onClick={handleSave} disabled={pageLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {/* <Button icon="delete" wait={1000} onClick={handleDelete} disabled={pageLoading}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button> */}
          {operationBtn}
        </>
      ) : operationBtn}
    </Header>
  );
};

export default PageHeader;
