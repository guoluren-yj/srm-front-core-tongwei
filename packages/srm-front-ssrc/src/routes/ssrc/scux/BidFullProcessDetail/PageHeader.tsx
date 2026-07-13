import React, { useMemo } from "react";

import { Header } from 'components/Page';
import intl from 'utils/intl';

interface CurrentStep {
  nodeStatus?: string;
  [key: string]: any; // 允许其他属性
}

interface PageHeaderProps {
  techFileId: string;
  pathname: string;
  currentStep?: CurrentStep;
}

// 技术文件 - 操作记录icon
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

const PageHeader: React.FC<PageHeaderProps> = (props) => {

  const { techFileId, pathname = '', currentStep } = props;

  const currentNode = useMemo(() => {
    if (currentStep) {
      return currentStep.nodeStatus;
    };
    return '';
  }, [currentStep]);

  // 头参数 - 【标题、返回路径】
  const headerProps = useMemo(() => {
    if (pathname.includes('/scux/ssrc/technical-documents-workbench')) {
      return {
        title: intl.get('scux.technicalDocumentsDetail.view.title.page.detail').d('技术文件详情'),
        backPath: '/scux/ssrc/technical-documents-workbench/list',
      };
    };
    if (pathname.includes('/scux/ssrc/bid-plan-workbench')) {
      return {
        title: intl.get('scux.bidPlanDetail.view.title.page.detail').d('招标计划明细'),
        backPath: '/scux/ssrc/bid-plan-workbench/list',
      };
    };
  }, [pathname]);

  // 头按钮
  const headerButtons = useMemo(() => {
    return [];
  }, []);

  return (
    <Header {...headerProps}>
      {headerButtons}
    </Header>
  );
}

export default PageHeader;