import React, { useMemo } from "react";
import { Button } from 'choerodon-ui/pro';
import { ButtonColor } from "choerodon-ui/pro/lib/button/enum";
import querystring from 'querystring';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import OperationRecordCux from 'srm-front-boot/lib/components/OperationRecordCux';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';

import {
  technicalDocumentsApi,
} from '../../api';
import { useStore } from '../store/StoreProvider';
import HistoryVersionListBtn from './HistoryVersionListBtn';

// 返回列表路径
const LIST_PATH = '/scux/ssrc/technical-documents-workbench/list';

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
      technicalFileDs,
    } = {},
    editorFlag,
    initData = () => {},
    pageLoading,
    setPageLoading = () => {},
    techFileId,
    history,
  } = useStore();

  // 校验页面数据
  const validatePageData = async () => {
    if (!baseInfoDs || !technicalFileDs) {
      return Promise.reject(new Error('Data sets are not initialized'));
    };

    const validateRes = await Promise.all([
      baseInfoDs.validate(),
      technicalFileDs.validate(),
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
      ...(baseInfoDs?.current?.toData() || {}),
      techFileDetailList: technicalFileDs?.toData(),
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
    return technicalDocumentsApi({
      postType: "SAVE",
      techFileInfo: pageData,
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
    if (!technicalFileDs?.length) {
      notification.error({
        message: intl.get('scux.bidPlanDetail.view.tip.submitErrorMessage').d('当前图纸行无数据，请维护后重新提交！'),
      });
      setPageLoading(false);
      return;
    };
    return technicalDocumentsApi({
      postType: "SUBMIT",
      techFileInfo: pageData,
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        history.push('/scux/ssrc/technical-documents-workbench/list');
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 标题
  const pageTitle = useMemo(() => {
    if (editorFlag) {
      return intl.get('scux.technicalDocumentsDetail.view.title.page.create').d('技术文件维护');
    };
    return intl.get('scux.technicalDocumentsDetail.view.title.page.detail').d('技术文件详情');
  }, []);

  // 通威二开 - 返回逻辑：
  // 切换版本进入的详情页（URL 带 techVersion）点击返回，回到同路由的无版本号详情页；
  // 无版本号详情页点击返回才回到列表。避免版本页返回时跳过“无版本号详情页”直接回列表。
  const backPath = useMemo(() => {
    const { search = '', pathname = '' } = history?.location || {};
    const searchParams = search ? querystring.parse(search.substr(1)) : {};
    if (searchParams.techVersion) {
      const { techVersion, ...restParams } = searchParams;
      const nextSearch = querystring.stringify(restParams);
      return `${pathname}${nextSearch ? `?${nextSearch}` : ''}`;
    }
    return LIST_PATH;
  }, [history?.location?.search, history?.location?.pathname]);

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
        sourceId: techFileId,
        actionType: "TECH_FILE",
      }}
      operateTransportParams={{
        method: "POST",
      }}
      statusIconTypes={statusIconTypes}
    />,
  ], [techFileId]);

  return (
    <Header
      title={pageTitle}
      backPath={backPath}
    >
      <HistoryVersionListBtn techFileId={techFileId} history={history} />
      {editorFlag ? (
        <>
          <Button icon="check" wait={1000} color={ButtonColor.primary} onClick={handleSubmit} disabled={pageLoading}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button icon="save" wait={1000} onClick={handleSave} disabled={pageLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {operationBtn}
        </>
      ) : operationBtn}
    </Header>
  );
};

export default PageHeader;
