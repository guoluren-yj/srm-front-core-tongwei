import React, { useMemo } from 'react';
import { Collapse, Button, Card } from 'choerodon-ui';
import { Form, Output, TextArea, TextField, Attachment } from 'choerodon-ui/pro';
import { observer, useObserver } from 'mobx-react-lite';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import { useStore } from '../store/StoreProvider';
import CommonLevel from '../../components/SecLevelTitle/CommonLevel';

const { Panel } = Collapse;

const BaseInfo: React.FC = observer(() => {
  const { commonDs, prefix } = useStore();
  const { headerDs } = commonDs || {};

  if (!headerDs) return null;

  const {
    rfxNum,
    rfxTitle,
    rfxHeaderId,
    attributeLongtext3,
    attributeLongtext24,
    attributeLongtext25,
    attributeBigint2,
  } = useObserver(() =>
    headerDs?.current?.get([
      'rfxNum',
      'rfxTitle',
      'rfxHeaderId',
      'attributeLongtext3',
      'attributeLongtext24',
      'attributeLongtext25',
      'attributeBigint2',
    ]) || {}
  );

  // 通威二开 - attributeBigint2 为 1 时才展示标后议价相关字段
  const showBidAfterBargain = Number(attributeBigint2) === 1;

  // 查看单据详情
  const handleViewDocDetail = () => {
    if (!rfxHeaderId) return;
    const path = `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`;
    openTab({
      key: path,
      path,
      title: 'srm.common.tab.title.bidDetail',
      action: intl.get('srm.common.tab.title.bidDetail').d('招标详情'),
      search: querystring.stringify({
        rfxHeaderId,
        sourceCategory: 'RFQ',
        backPath: 'NO',
      }),
      closable: true,
    }, undefined);
  };

  // 查看FBC审批链接
  const handleViewFbc = () => {
    if (attributeLongtext3) {
      window.open(attributeLongtext3);
    }
  };

  // 查看FBC流程：attributeLongtext24 本身是URL时直接打开；
  // 否则用后端在触发FBC后写入的 attributeLongtext25 作为跳转地址（该字段不单独展示）
  const handleViewFbcProcess = () => {
    const isUrl = /^https?:\/\//i.test(attributeLongtext24 || '');
    const url = isUrl ? attributeLongtext24 : attributeLongtext25;
    if (url) {
      window.open(url);
    }
  };

  // 折叠面板标题
  const panelHeader = useMemo(() => {
    return (
      <span>
        <span>{`${rfxNum}-${rfxTitle}`}</span>
        <Button icon="feed" funcType={FuncType.flat} onClick={handleViewDocDetail}>{intl.get('scux.bidEvaluationManagement.view.title.viewDocDetail').d('查看单据详情')}</Button>
      </span>
    );
  }, [rfxNum, rfxTitle]);

  return (
    <Collapse
      defaultActiveKey={['baseInfo']}
      expandIconPosition="text-right"
      ghost
    >
      <Panel header={panelHeader} key="baseInfo">
        <Card
          title={<CommonLevel title={intl.get(`${prefix}.view.card.title.preWinningBidDetail`).d('决标明细')} />}
          id="cuxBasicInfo"
          bordered={false}
        >
          <Form
            dataSet={headerDs}
            columns={3}
            labelLayout={LabelLayout.float}
            useWidthPercent
          >
            <Output name="currencyCode" />
            <Output name="attributeDecimal7" />
            <Output name="attributeDecimal9" />
            <TextArea name="attributeLongtext30" newLine colSpan={2} resize={ResizeType.vertical} />
            <Output
              newLine
              name="attributeLongtext31"
              renderer={({ value }) =>
                value && attributeLongtext3 ? (
                  <a onClick={handleViewFbc}>{value}</a>
                ) : (
                  value
                )
              }
            />
            <TextField name="attributeLongtext32" />
            {/* <TextField name="attributeLongtext3" /> */}
            {/* 通威二开 - 标后议价信息，仅 attributeBigint2 === 1 时展示，均为只读展示 */}
            {showBidAfterBargain && (
              <>
                <Output name="attributeLongtext27" newLine />
                {/* viewMode="popup" 时组件只渲染「查看附件」按钮、不展示字段 label，
                    这里用默认的 list 只读模式，label 与附件列表（可预览/下载）一起展示 */}
                <Attachment name="attributeLongtext28" readOnly />
                <Output
                  name="attributeLongtext24"
                  renderer={({ value }) =>
                    value && (/^https?:\/\//i.test(value) || attributeLongtext25) ? (
                      <a onClick={handleViewFbcProcess}>{value}</a>
                    ) : (
                      value
                    )
                  }
                />
                <Output name="attributeVarchar27" />
                <Output name="attributeVarchar28" />
              </>
            )}
          </Form>
        </Card>
      </Panel>
    </Collapse>
  );
});

export default BaseInfo;
