/* eslint-disable react/no-array-index-key */
import React, { useMemo, useState, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import intl from 'utils/intl';

import {
  LiabilitiesDS,
  ShareholdersDS,
  EquityChangeDS,
  InvestmentDS,
  TotalProfitDS,
  ShareEarningsDS,
  OperatingProfitDS,
  TotalComprehensiveIncomeDS,
  OtherOperatingIncomeDS,
  IncomeDS,
  TotalOperatingCostDS,
  NetProfitDS,
  OtherComprehensiveIncomeDS,
  RaxRecordsDS,
  FinancingInfoDS,
  KeyPersonnelDS,
  IndividualsDS,
  PatentInfoDS,
  CompetitiveInfoDS,
} from '../stores/monitorDS';
import CommonTable from './CommonTable';
import ReportPanel from './ReportPanel';
import styles from './index.less';

const { Panel } = Collapse;

export default function FinancialReport({ scanData = [], keyword = '', loading }) {
  const liabilitiesDS = useMemo(() => new DataSet({ ...LiabilitiesDS() }), []);
  const shareholdersDS = useMemo(() => new DataSet({ ...ShareholdersDS() }), []);
  const equityChangeDS = useMemo(() => new DataSet({ ...EquityChangeDS() }), []);
  const investmentDS = useMemo(() => new DataSet({ ...InvestmentDS() }), []);
  const totalProfitDS = useMemo(() => new DataSet({ ...TotalProfitDS() }), []);
  const shareEarningsDS = useMemo(() => new DataSet(ShareEarningsDS()), []);
  const operatingProfitDS = useMemo(() => new DataSet(OperatingProfitDS()), []);
  const totalComprehensiveIncomeDS = useMemo(() => new DataSet(TotalComprehensiveIncomeDS()), []);
  const otherOperatingIncomeDS = useMemo(() => new DataSet(OtherOperatingIncomeDS()), []);
  const incomeDS = useMemo(() => new DataSet(IncomeDS()), []);
  const totalOperatingCostDS = useMemo(() => new DataSet(TotalOperatingCostDS()), []);
  const netProfitDS = useMemo(() => new DataSet(NetProfitDS()), []);
  const otherComprehensiveIncomeDS = useMemo(() => new DataSet(OtherComprehensiveIncomeDS()), []);
  const raxRecordsDS = useMemo(() => new DataSet(RaxRecordsDS()), []);
  const financingInfoDS = useMemo(() => new DataSet(FinancingInfoDS()), []);
  const keyPersonnelDS = useMemo(() => new DataSet(KeyPersonnelDS()), []);
  const individualsDS = useMemo(() => new DataSet(IndividualsDS()), []);
  const patentInfoDS = useMemo(() => new DataSet(PatentInfoDS()), []);
  const competitiveInfoDS = useMemo(() => new DataSet(CompetitiveInfoDS()), []);

  const [reportData, setReportData] = useState([]); // 工商年报
  // const [creditGrade, setCreditGrade] = useState([]); // 信用评级

  useEffect(() => {
    if (scanData.length > 0) {
      // 工商年报
      const reportObj =
        scanData.filter((item) => item.riskCode === 'QUERY_EP_RISK_REPORT_LIST_V2')[0]
          ?.changeList ?? [];

      // 信用评级
      const creditData =
        scanData.filter((item) => item.riskCode === 'QUERY_EP_RISK_CREDIT_GRADE_V2')[0]
          ?.changeList ?? [];

      // 融资信息
      const financingInfo =
        scanData.filter((item) => item.riskCode === 'QUERY_EP_RISK_FINANCING_V2')[0]?.changeList ??
        [];

      const profitInfo =
        scanData.filter((item) => item.riskCode === 'QUERY_EP_RISK_INCOME_STATEMENT_V2')[0]
          ?.changeList ?? [];

      const gradeList = creditData.length ? creditData[0]?.riskMessage?.stdGradeList ?? [] : [];
      const finacingList = financingInfo.length
        ? financingInfo[0]?.riskMessage?.stdFinancingList ?? []
        : [];

      const keyPersonnelList = [];
      const keyPersonnelData =
        scanData.filter((item) => item.riskCode === 'QUERY_EP_RISK_KEY_PERSONNEL_V2')[0]
          ?.changeList ?? [];

      if (keyPersonnelData && keyPersonnelData.length) {
        keyPersonnelData.forEach((rcd) => {
          keyPersonnelList.push(rcd?.riskMessage);
        });
      }

      const individualsData =
        scanData.filter((item) => item.riskCode === 'QUERY_EP_RISK_SOCIAL_SECURITY_V2')[0]
          ?.changeList ?? [];
      const individualsList = [];
      if (individualsData && individualsData.length) {
        individualsData.forEach((rcd) => {
          individualsList.push({
            stdReportYear: rcd?.riskMessage?.stdReportYear,
            ...(rcd?.riskMessage?.stdSocialSecurity ?? {}),
          });
        });
      }

      const patentInfoData =
        scanData.filter((item) => item.riskCode === 'QUERY_EP_RISK_PATENT_LIST_V2')[0]
          ?.changeList ?? [];
      const patentInfoList = [];
      if (patentInfoData && patentInfoData.length) {
        patentInfoData.forEach((rcd) => {
          patentInfoList.push(rcd?.riskMessage ?? {});
        });
      }

      const competitiveInfoData =
        scanData.filter((item) => item.riskCode === 'QUERY_EP_RISK_COMPETITIVE_INFORMATION_V2')[0]
          ?.changeList ?? [];
      const competitiveInfoList = [];
      if (competitiveInfoData && competitiveInfoData.length) {
        competitiveInfoData.forEach((rcd) => {
          competitiveInfoList.push(rcd?.riskMessage ?? {});
        });
      }

      const {
        stdTotalProfitList = [], // 利润总额
        stdEarningsPerShareList = [], // 每股收益
        stdOperatingProfitList = [], // 营业利润
        stdTotalComprehensiveIncomeList = [], // 综合收益总额
        stdOtherOperatingIncomeList = [], // 其他经营收益集合
        stdOperatingRevenueList = [], // 营业收入
        stdTotalOperatingCostList = [], // 营业成本
        stdOtherComprehensiveIncomeList = [], // 其他综合收益
        stdNetProfitList = [], // 净利润
      } = profitInfo.length ? profitInfo[0]?.riskMessage : {};

      raxRecordsDS.loadData(gradeList);
      financingInfoDS.loadData(finacingList);
      totalProfitDS.loadData(
        stdTotalProfitList?.filter((item) => item && typeof item === 'object')
      );
      shareEarningsDS.loadData(
        stdEarningsPerShareList?.filter((item) => item && typeof item === 'object')
      );
      operatingProfitDS.loadData(
        stdOperatingProfitList?.filter((item) => item && typeof item === 'object')
      );
      totalComprehensiveIncomeDS.loadData(
        stdTotalComprehensiveIncomeList?.filter((item) => item && typeof item === 'object')
      );
      otherOperatingIncomeDS.loadData(
        stdOtherOperatingIncomeList?.filter((item) => item && typeof item === 'object')
      );
      incomeDS.loadData(
        stdOperatingRevenueList?.filter((item) => item && typeof item === 'object')
      );
      totalOperatingCostDS.loadData(
        stdTotalOperatingCostList?.filter((item) => item && typeof item === 'object')
      );
      otherComprehensiveIncomeDS.loadData(
        stdOtherComprehensiveIncomeList?.filter((item) => item && typeof item === 'object')
      );
      netProfitDS.loadData(stdNetProfitList?.filter((item) => item && typeof item === 'object'));
      keyPersonnelDS.loadData(keyPersonnelList);

      individualsDS.loadData(individualsList);
      patentInfoDS.loadData(patentInfoList);
      competitiveInfoDS.loadData(competitiveInfoList);
      setReportData(reportObj);
    }
  }, [scanData]);

  const totalProfitColumns = () => {
    return [
      {
        name: 'stdFormatReportdate',
      },
      {
        name: 'stdIncometax',
      },
      {
        name: 'stdSumprofit',
      },
      {
        name: 'stdUnconfirminvloss',
      },
      {
        name: 'stdNetprofitother1',
      },
      { name: 'stdNetprofitbalance1' },
    ];
  };

  const shareEarningsColumns = () => {
    return [
      {
        name: 'stdFormatReportdate',
      },
      {
        name: 'stdDilutedeps',
      },
      {
        name: 'stdBasiceps',
      },
    ];
  };

  const operatingProfitColumns = () => {
    return [
      {
        name: 'stdFormatReportdate',
      },
      {
        name: 'stdNonoperateexp',
      },
      {
        name: 'stdNonoperatereve',
      },
      {
        name: 'stdNonlassetnetloss',
      },
      {
        name: 'stdSumprofitbalance',
      },
      {
        name: 'stdSumprofitother',
      },
      {
        name: 'stdOperateprofit',
      },
    ];
  };

  const totalComprehensiveIncomeColumns = () => {
    return [
      {
        name: 'stdFormatReportdate',
      },
      {
        name: 'stdSumcincome',
      },
      {
        name: 'stdMinoritycincome',
      },
      {
        name: 'stdParentcincome',
      },
      {
        name: 'stdCincomebalance2',
      },
    ];
  };

  const otherOperatingIncomeColumns = () => {
    return [
      {
        name: 'stdFormatReportdate',
      },
      {
        name: 'stdOperateprofitother',
      },
      {
        name: 'stdInvestincome',
      },
      {
        name: 'stdExchangeincome',
      },
      {
        name: 'stdFvalueincome',
      },
      {
        name: 'stdInvestjointincome',
      },
      {
        name: 'stdOperateprofitbalance',
      },
    ];
  };

  const incomeColumns = () => {
    return [
      {
        name: 'stdFormatReportdate',
      },
      {
        name: 'stdOtherreve',
      },
      {
        name: 'stdTotaloperatereve',
      },
      {
        name: 'stdTotaloperatereveother',
      },
      {
        name: 'stdCommreve',
      },
      {
        name: 'stdIntreve',
      },
      {
        name: 'stdPremiumearned',
      },
      {
        name: 'stdOperatereve',
      },
    ];
  };

  const totalOperatingCostColumns = () => {
    return [
      {
        name: 'stdFormatReportdate',
      },
      {
        name: 'stdOfwintexp',
      },
      {
        name: 'stdOfwintreve',
      },
      {
        name: 'stdMiotherincome',
      },
      {
        name: 'stdCreddevalueloss',
      },
      {
        name: 'stdAssetimpairmentincome',
      },
      {
        name: 'stdAdisposalincome',
      },
      {
        name: 'stdTotaloperateexp',
      },
      {
        name: 'stdFinanceexp',
      },
      {
        name: 'stdReinsurancecost',
      },
      {
        name: 'stdInsurancecontractreserve',
      },
      {
        name: 'stdIntexp',
      },
      {
        name: 'stdRdcost',
      },
      {
        name: 'stdManagementcost',
      },
      {
        name: 'stdOtherbusinesscost',
      },
      {
        name: 'stdCommissioncost',
      },
      {
        name: 'stdOtheroperatingcost',
      },
      {
        name: 'stdOperatingcost',
      },
      {
        name: 'stdCompensationexp',
      },
      {
        name: 'stdSalescost',
      },
      {
        name: 'stdRetirementcost',
      },
      {
        name: 'stdBusinesstax',
      },
      {
        name: 'stdAssetloss',
      },
      {
        name: 'stdPolicydividend',
      },
    ];
  };

  const netProfitColumns = () => {
    return [
      {
        name: 'stdFormatReportdate',
      },
      {
        name: 'stdContinuousonprofit',
      },
      {
        name: 'stdTerminationonprofit',
      },
      {
        name: 'stdNetprofitother2',
      },
      {
        name: 'stdCombinednetprofitb',
      },
      {
        name: 'stdMinorityincome',
      },
      {
        name: 'stdNetprofit',
      },
      {
        name: 'stdParentnetprofit',
      },
    ];
  };

  const otherComprehensiveIncomeColumns = () => {
    return [
      {
        name: 'stdFormatReportdate',
      },
      {
        name: 'stdCincomebalance1',
      },
      {
        name: 'stdMinorityothercincome',
      },
      {
        name: 'stdParentothercincome',
      },
      {
        name: 'stdOthercincome',
      },
    ];
  };

  const raxRecordsColumns = () => {
    return [
      {
        name: 'stdYear',
      },
      {
        name: 'stdGrade',
      },
    ];
  };

  const handleJump = (url = '') => {
    if (url) window.open(url, '_blank');
  };

  const financingInfoColumns = () => {
    return [
      {
        name: 'serialNumber',
        renderer: ({ record }) => {
          const { currentPage, pageSize } = financingInfoDS;
          return record.index + 1 + (currentPage - 1) * pageSize;
        },
      },
      {
        name: 'stdFinanceDate',
      },
      {
        name: 'stdFinancingRound',
      },
      {
        name: 'stdFinancingAmount',
      },
      {
        name: 'investor',
        renderer: ({ record }) => {
          const investors = record?.get('stdInvestors') ?? [];
          const names = investors.map((item) => item?.stdOrgName) ?? [];
          return names.length ? names.join('、') : '';
        },
      },
      {
        name: 'newsList',
        renderer: ({ record }) => {
          const news = record?.get('stdNews') ?? [];
          return (
            <>
              {news.map((item, index) => {
                return (
                  <a
                    key={index}
                    onClick={() => handleJump(item?.stdUrl)}
                    style={{ marginRight: '8px' }}
                  >
                    {item?.stdTitle}
                  </a>
                );
              })}
            </>
          );
        },
      },
    ];
  };

  const keyPersonnelColumns = () => {
    return [{ name: 'stdName' }, { name: 'stdTitle' }];
  };

  const individualsColumns = () => {
    return [
      { name: 'stdReportYear' },
      { name: 'stdBasicEndowmentNum' },
      { name: 'stdInsuranceNum' },
      { name: 'stdBirthNum' },
      { name: 'stdInjuryInsuranceNum' },
      { name: 'stdUnemploymentNum' },
    ];
  };

  const patentInfoColumns = () => {
    return [
      { name: 'stdPatentName' },
      { name: 'stdRequestNum' },
      { name: 'stdTypeName' },
      { name: 'stdRole' },
      { name: 'stdRequestDate' },
      { name: 'stdAuthorizeDate' },
      { name: 'stdOuthorDate' },
      { name: 'stdOuthorNum' },
      { name: 'stdLastStatus' },
    ];
  };

  const competitiveInfoColumns = () => {
    return [
      { name: 'stdName' },
      { name: 'stdRound' },
      { name: 'stdDate' },
      { name: 'stdCategory' },
      { name: 'stdBrief' },
      { name: 'stdEname' },
      { name: 'stdOperateStatus' },
    ];
  };

  const customPanelStyle = {
    background: '#f7f7f7',
    borderRadius: 4,
    marginBottom: 24,
    border: 0,
    overflow: 'hidden',
  };

  return (
    <div style={{ display: loading ? 'none' : 'block' }}>
      <Collapse bordered={false} style={{ marginTop: '12px' }}>
        {keyPersonnelDS && keyPersonnelDS.length ? (
          <Panel
            header={`${keyword || ''} - ${intl
              .get('sdat.riskScanReport.view.title.keyPersonnel')
              .d('主要人员')}`}
            key="KeyPersonnel"
            style={customPanelStyle}
          >
            <div style={{ maxHeight: '400px' }}>
              <Table
                dataSet={keyPersonnelDS}
                columns={keyPersonnelColumns()}
                queryBar="none"
                border={false}
                autoHeight={{ type: 'maxHeight', diff: 40 }}
              />
            </div>
          </Panel>
        ) : null}

        {reportData.map((item) => {
          const reportRowData = item?.riskMessage ?? {};

          return (
            <Panel
              header={`${reportRowData?.stdName ?? ''} - ${
                reportRowData?.stdReportYear ?? ''
              } ${intl.get('sdat.riskScanReport.view.title.businessReport').d('工商年报')}`}
              key={reportRowData.stdReportYear}
              style={customPanelStyle}
            >
              <ReportPanel
                reportData={reportRowData}
                liabilitiesDS={liabilitiesDS}
                shareholdersDS={shareholdersDS}
                equityChangeDS={equityChangeDS}
                investmentDS={investmentDS}
              />
            </Panel>
          );
        })}

        {totalProfitDS.length ||
        shareEarningsDS.length ||
        operatingProfitDS.length ||
        totalComprehensiveIncomeDS.length ||
        otherOperatingIncomeDS.length ||
        incomeDS.length ||
        totalOperatingCostDS.length ||
        otherComprehensiveIncomeDS.length ||
        netProfitDS.length ? (
          <Panel
            header={`${keyword || ''} ${intl
              .get('sdat.riskScanReport.view.title.financialReport')
              .d('财报')}`}
            key="2"
            style={customPanelStyle}
          >
            {totalProfitDS.length ? (
              <div style={{ marginTop: '12px' }}>
                <div className={styles['risk-scan-basic-business-report-h2-title']}>
                  {intl.get('sdat.riskScanReport.model.totalProfit1').d('利润总额')}
                </div>
                <CommonTable dataSet={totalProfitDS} columns={totalProfitColumns()} />
              </div>
            ) : null}

            {shareEarningsDS.length ? (
              <div style={{ marginTop: '12px' }}>
                <div className={styles['risk-scan-basic-business-report-h2-title']}>
                  {intl.get('sdat.riskScanReport.view.title.earningsPerShare').d('每股收益')}
                </div>
                <CommonTable dataSet={shareEarningsDS} columns={shareEarningsColumns()} />
              </div>
            ) : null}

            {operatingProfitDS.length ? (
              <div style={{ marginTop: '12px' }}>
                <div className={styles['risk-scan-basic-business-report-h2-title']}>
                  {intl.get('sdat.riskScanReport.view.title.operatingProfit').d('营业利润')}
                </div>
                <CommonTable dataSet={operatingProfitDS} columns={operatingProfitColumns()} />
              </div>
            ) : null}

            {totalComprehensiveIncomeDS.length ? (
              <div style={{ marginTop: '12px' }}>
                <div className={styles['risk-scan-basic-business-report-h2-title']}>
                  {intl
                    .get('sdat.riskScanReport.view.title.totalComprehensiveIncome')
                    .d('综合收益总额')}
                </div>
                <CommonTable
                  dataSet={totalComprehensiveIncomeDS}
                  columns={totalComprehensiveIncomeColumns()}
                />
              </div>
            ) : null}

            {otherOperatingIncomeDS.length ? (
              <div style={{ marginTop: '12px' }}>
                <div className={styles['risk-scan-basic-business-report-h2-title']}>
                  {intl
                    .get('sdat.riskScanReport.view.title.otherOperatingIncome')
                    .d('其他经营收益')}
                </div>
                <CommonTable
                  dataSet={otherOperatingIncomeDS}
                  columns={otherOperatingIncomeColumns()}
                />
              </div>
            ) : null}

            {incomeDS.length ? (
              <div style={{ marginTop: '12px' }}>
                <div className={styles['risk-scan-basic-business-report-h2-title']}>
                  {intl.get('sdat.riskScanReport.view.title.operatingRevenue').d('营业收入')}
                </div>
                <CommonTable dataSet={incomeDS} columns={incomeColumns()} />
              </div>
            ) : null}

            {totalOperatingCostDS.length ? (
              <div style={{ marginTop: '12px' }}>
                <div className={styles['risk-scan-basic-business-report-h2-title']}>
                  {intl.get('sdat.riskScanReport.view.title.totalOperatingCost').d('营业总成本')}
                </div>
                <CommonTable dataSet={totalOperatingCostDS} columns={totalOperatingCostColumns()} />
              </div>
            ) : null}

            {otherComprehensiveIncomeDS.length ? (
              <div style={{ marginTop: '12px' }}>
                <div className={styles['risk-scan-basic-business-report-h2-title']}>
                  {intl
                    .get('sdat.riskScanReport.view.title.otherComprehensiveIncome')
                    .d('其他综合收益')}
                </div>
                <CommonTable
                  dataSet={otherComprehensiveIncomeDS}
                  columns={otherComprehensiveIncomeColumns()}
                />
              </div>
            ) : null}

            {netProfitDS.length ? (
              <div style={{ marginTop: '12px' }}>
                <div className={styles['risk-scan-basic-business-report-h2-title']}>
                  {intl.get('sdat.riskScanReport.view.title.netProfit').d('净利润')}
                </div>
                <CommonTable dataSet={netProfitDS} columns={netProfitColumns()} />
              </div>
            ) : null}
          </Panel>
        ) : null}

        {raxRecordsDS.length ? (
          <Panel
            header={intl.get('sdat.riskScanReport.view.title.taxlevelRecord').d('纳税A级记录')}
            key="3"
            style={customPanelStyle}
          >
            <div style={{ marginTop: '12px' }}>
              <CommonTable dataSet={raxRecordsDS} columns={raxRecordsColumns()} />
            </div>
          </Panel>
        ) : null}

        {financingInfoDS.length ? (
          <Panel
            header={intl.get('sdat.riskScanReport.view.title.financingInfo').d('融资信息')}
            key="4"
            style={customPanelStyle}
          >
            <div style={{ marginTop: '12px' }}>
              <CommonTable dataSet={financingInfoDS} columns={financingInfoColumns()} />
            </div>
          </Panel>
        ) : null}

        {individualsDS.length ? (
          <Panel
            header={intl.get('sdat.riskScanReport.view.title.individuals').d('参保人数')}
            key="individuals"
            style={customPanelStyle}
          >
            <div style={{ marginTop: '12px' }}>
              <CommonTable dataSet={individualsDS} columns={individualsColumns()} />
            </div>
          </Panel>
        ) : null}

        {patentInfoDS.length ? (
          <Panel
            header={intl.get('sdat.riskScanReport.view.title.patentInfo').d('专利信息')}
            key="patentInfo"
            style={customPanelStyle}
          >
            <div style={{ marginTop: '12px' }}>
              <CommonTable dataSet={patentInfoDS} columns={patentInfoColumns()} />
            </div>
          </Panel>
        ) : null}

        {competitiveInfoDS.length ? (
          <Panel
            header={intl.get('sdat.riskScanReport.view.title.competitiveInfo').d('竞品信息')}
            key="competitiveInfo"
            style={customPanelStyle}
          >
            <div style={{ marginTop: '12px' }}>
              <CommonTable dataSet={competitiveInfoDS} columns={competitiveInfoColumns()} />
            </div>
          </Panel>
        ) : null}
      </Collapse>
    </div>
  );
}
