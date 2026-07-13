import React, { useEffect, useMemo, useState } from 'react';
import querystring from 'querystring';
import { Steps } from 'choerodon-ui';

import { getResponse, getCurrentTenant, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import intl from 'utils/intl';

import { fetchRfxDetailConfigs } from '@/services/inquiryHallNewService';

import PageHeader from './PageHeader';
import BidPreparation from './BidPreparation';
import Style from './index.less';

const { Step } = Steps;

// 添加类型定义
interface StepItem {
  nodeStatus?: string;
  [key: string]: any;
}

const Index = (props) => {

  const {
    match: {
      params: {
        sourceProjectId = '',
        techFileId = '',
        rfxHeaderId = null, // 这里是没有rfxHeaderId，还没到生成询价单的时候
      } = {},
    },
    location = { pathname: '', search: '' },
    history,
  } = props;

  const { pathname } = location;

  const [stepList, setStepList] = useState<StepItem[]>([]);
  const [currentStep, setCurrentStep] = useState<StepItem>({});
  const [initCurrentIndex, setInitCurrentIndex] = useState<number>(0);

  const memoRfxHeaderId = useMemo(() => {
    if (['null', null, '', '-1'].includes(rfxHeaderId)) {
      return null;
    };
    return rfxHeaderId;
  }, [rfxHeaderId]);

  useEffect(() => {
    intiStep();
  }, []);

  const intiStep = async () => {
    if (!sourceProjectId) return;
    try {
      const configs = await fetchRfxDetailConfigs({
        organizationId: getCurrentOrganizationId(),
        rfxHeaderId: memoRfxHeaderId, // -1时还没有生成找表单
        sourceProjectId,
        configKeys: [
          'sourceLayout',
          'checkPriceWay',
          `checkPriceWay#${memoRfxHeaderId}`,
          'sectionBidSwitchInform',
        ],
        tableCode: 'source_old_ui_config',
        condition: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      if (!getResponse(configs)) {
        return;
      };
      const nodeList = configs.processBar || [];
      const currentNode = nodeList.find((item) => item.nodeFlag === 0);
      setInitCurrentIndex(nodeList.findIndex((s) => s.nodeFlag === 0));
      setStepList(configs.processBar || []);
      setCurrentStep(currentNode);
    } catch (e) {
      throw e;
    }
  };

  // 获取动态组件
  const getEmbedPage = (payload) => {
    const {
      searchParams = {},
      routePath,
      params,
    } = payload || {};
    const search = querystring.stringify(searchParams);
    const _location = {
      hash: '',
      pathname: routePath,
      search: `?${search}`,
    };
    const flexLinkProps = {
      path: routePath,
      location: _location,
      match: {
        params,
        path: routePath,
      },
      history: {
        // ...(window?.dvaApp?._history || history), TODO: 临时解决
        ...props.history,
        location: _location,
      },
    };
    return <EmbedPage href={routePath} {...flexLinkProps} />
  };

  const stepsContent = useMemo(() => {
    return {
      'BID_PLAN' : {
        title: intl.get('scux.bidPlanDetail.view.title.page.detail').d('招标计划明细'),
        component: getEmbedPage({
          routePath: `/scux/ssrc/bid-plan-workbench/bp-detail/${sourceProjectId}`,
          params: {
            sourceProjectId,
          }
        }),
      },
      'BID_PREPARE' : {
        title: intl.get('scux.bidPlanDetail.view.title.page.preparation').d('招标准备'),
        component: <BidPreparation sourceProjectId={sourceProjectId} />
      },
    }
  }, [sourceProjectId, techFileId]);

  // 切换步骤条节点
  const handleChangeStep = (current) => {
    if (current > initCurrentIndex) {
      return;
    };
    setCurrentStep(stepList[current ?? 0]);
    if (!['BID_PLAN', 'BID_PREPARE', 'BID_FILE'].includes(stepList[current]?.nodeStatus || '') && memoRfxHeaderId) {
      history.push({
        pathname: `/ssrc/new-bid-hall/bid-detail/${memoRfxHeaderId}`,
      });
    };
  };

  // 获取当前步骤条节点索引
  const currentIndex = useMemo(() => {
    return stepList.findIndex((s) => s.nodeFlag === 0);
  }, [stepList]);

  return (
    <div className={Style['scux-bid-full-process-detail-wrapper']}>
      <PageHeader pathname={pathname} techFileId={techFileId} currentStep={currentStep} />
      <div className={Style['scux-bid-full-process-detail-container']}>
        <div className={Style['scux-bid-full-process-detail-step']}>
          <Steps current={currentIndex} onChange={handleChangeStep}>
            {stepList.map(step => (
              <Step key={step.nodeStatus} title={step.nodeStatusMeaning} />
            ))}
          </Steps>
        </div>
        <div className={Style['scux-bid-full-process-detail-content']}>
          {(currentStep?.nodeStatus && stepsContent[currentStep.nodeStatus]?.component) || null}
        </div>
      </div>
    </div>
  )
};

export default formatterCollections({ code: [
  'scux.bidPlanDetail',
  'sscux.ssrc',
  'scux.technicalDocumentsDetail',
  'scux.bidPlanWorkBench',
  'scux.technicalDocumentsWorkBench',
  'scux.supplierEvaluation',
] })(Index);