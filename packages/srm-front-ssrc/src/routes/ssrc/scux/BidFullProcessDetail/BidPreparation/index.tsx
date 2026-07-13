import React, { useEffect } from 'react';
import { Tabs, Card, Spin } from 'choerodon-ui';
import { useDataSet } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import {
  BaseInfo,
  TenderListSection,
  SupplierList,
  TechnicalFile,
} from './components';
import {
  technicalFileHeaderDS,
  technicalFileDS,
  supplierEvaluationHeaderDS,
  supplierListDS,
  tenderHeaderDS,
  tenderListSectionDS,
} from './store/storeDS';
import { baseInfoDS } from '../../BidPlanWorkBench/BidPlanDetail/store/storeDS';
import { fetchPreparationPageData } from './api';
import Style from './index.less';

const { TabPane } = Tabs;

interface IndexProps {
  history?: any;
  sourceProjectId: string;
};

const Index: React.FC<IndexProps> = (props) => {
  const { sourceProjectId, history } = props;

  const baseInfoDs = useDataSet(() => baseInfoDS({ sourceProjectId }), [sourceProjectId]);
  const technicalFileHeaderDs = useDataSet(() => technicalFileHeaderDS(), []);
  const technicalFileDs = useDataSet(() => technicalFileDS(), []);
  const supplierEvaluationHeaderDs = useDataSet(() => supplierEvaluationHeaderDS(), []);
  const supplierListDs = useDataSet(() => supplierListDS(), []);
  const tenderHeaderDs = useDataSet(() => tenderHeaderDS(), []);
  const tenderListSectionDs = useDataSet(() => tenderListSectionDS(), []);

  useEffect(() => {
    initData();
  }, [sourceProjectId]);

  const initData = () => {
    if (!sourceProjectId) return;
    baseInfoDs.query();
    return fetchPreparationPageData({ sourceProjectId }).then(res => {
      if (getResponse(res)) {
        const { bidCatalog, bidTechFile, bidNomination } = res;
        if (bidCatalog) {
          const { catalogSections, ...catalogOthers } = bidCatalog;
          tenderHeaderDs.loadData([catalogOthers]);
          tenderListSectionDs.loadData(catalogSections || []);
        };
        if (bidTechFile) {
          const { techFileDetails, ...techFileOthers} = bidTechFile;
          technicalFileHeaderDs.loadData([techFileOthers]);
          technicalFileDs.loadData(techFileDetails || []);
        };
        if (bidNomination) {
          const { nominationSupLines, ...nominationOthers } = bidNomination;
          supplierEvaluationHeaderDs.loadData([nominationOthers]);
          supplierListDs.loadData(nominationSupLines || []);
        };
      };
    });
  };

  return (
    <div className={Style['detail-content-wrapper']}>
      <Spin spinning={false}>
        <div className={Style['detail-content']}>
          <Card
            title={intl.get('scux.bidPlanDetail.view.card.title.baseInfo').d('基础信息')}
            id="bidPreparation-baseInfo"
            bordered={false}
          >
            <BaseInfo baseInfoDs={baseInfoDs} />
          </Card>
          <Card
            title={null}
            id="bidPreparation-content"
            bordered={false}
          >
            <Tabs className='scux-technical-documents-content-detail-tabs'>
              <TabPane tab={intl.get('scux.tenderDetail.view.tab.tenderList').d('招标清单')} key="tenderList">
                <TenderListSection tenderHeaderDs={tenderHeaderDs} tenderListSectionDs={tenderListSectionDs} />
              </TabPane>
              <TabPane tab={intl.get('scux.technicalDocumentsDetail.view.tab.technicalFile').d('技术文件（含图纸）')} key="technicalFile">
                <TechnicalFile technicalFileHeaderDs={technicalFileHeaderDs} technicalFileDs={technicalFileDs} />
              </TabPane>
              <TabPane tab={intl.get('scux.bidPreparation.view.tab.unitsWithInTheRange').d('入围单位')} key="unitsWithInTheRange">
                <SupplierList supplierEvaluationHeaderDs={supplierEvaluationHeaderDs} supplierListDs={supplierListDs} history={history} />
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </Spin>
    </div>
  );
};

export default formatterCollections({
  code: [
    'scux.bidPlanDetail',
    'sscux.ssrc',
    'scux.technicalDocumentsDetail',
    'scux.bidPreparation',
    'scux.tenderDetail',
    'scux.supplierEvaluation',
  ],
})(Index);
