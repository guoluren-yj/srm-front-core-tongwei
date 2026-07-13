import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { Modal, Form, Output } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { queryIdpValue } from 'services/api';

import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { getResponse } from '@/utils/utils';
import { getMsgByLovCode, getNewsContent } from '@/services/monitorStuffService'; // getMonitorStuffData

import style from './index.less';

const {
  options: { currentLocale, locales },
} = intl;
const intlMapObj = locales[`${currentLocale}`];

const commonFields = ['eventName', 'eventLevel', 'eventTime', 'planNumber', 'scopeType'];

const iframeKey = Modal.key();

let scopeMap = {};

const CommonDetail = (props) => {
  const {
    detail = {},
    dimensionCode = '',
    localRecord = {},
    showCommon = false,
    fieldWidth = '',
  } = props;

  const [codeMap, setCodeMap] = useState({});
  const [emotionMap, setEmotionMap] = useState({});
  const [categoryMap, setCategoryMap] = useState({});
  const [localFields, setLocalFields] = useState([]);
  const [roleTypeMap, setRoleTypeMap] = useState({});
  // const [scopeMap, setScopeMap] = useState({});

  useEffect(() => {
    // 角色类型
    queryIdpValue('SDAT.ROLE_TYPE_LIST').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        setRoleTypeMap(obj);
      }
    });

    // 情感类型
    queryIdpValue('SDAT.RISK_NEWS_EMOTION_TYPE').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        setEmotionMap(obj);
      }
    });

    // 类别
    queryIdpValue('SDAT.RISK_NEWS_CATEGORY').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        setCategoryMap(obj);
      }
    });

    // 维度
    queryIdpValue('SDAT.WB2_SCAN_SCOPE_TYPE').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        scopeMap = { ...obj };
      }
    });

    queryIdpValue('SDAT.WORKBENCH_EVENT_LEVEL').then((res) => {
      if (getResponse(res) && res.length) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });

        const data = [];
        commonFields.forEach((item) => {
          data.push({
            u_id: uuid(),
            fieldName: item,
            level: String(localRecord[item]),
            label: item ? intl.get(`sdat.riskControl.view.title.${item}`) : '',
            value:
              item === 'eventLevel'
                ? obj[String(localRecord[item])]
                : localRecord[item] || detail[item] || '',
          });
        });
        // setLevelMap(obj);
        setLocalFields(data);
      }
    });

    // 维度编码的值集
    getMsgByLovCode({ code: 'SDAT.RISK_WB2_WORKPLACE_EVENTTYPE_LIST' }).then((res) => {
      const mapObj = {};
      (res || []).forEach((item) => {
        Object.assign(mapObj, { [item?.value]: { meaning: item?.meaning, tag: item?.tag } });
      });
      setCodeMap(mapObj);
    });

    return () => {
      scopeMap = {};
    };
  }, []);

  const classMap = {
    3: style['incident-item-tag-high'],
    2: style['incident-item-tag-middle'],
    1: style['incident-item-tag-low'],
  };

  const renderTree = (details = {}, code = '') => {
    const obj = details ? { ...details } : {};

    // if (code === '-1') {
    //   // 手工新建风险
    //   return renderManualNew(obj);
    // }

    if (obj?.dsType === 'CUS') {
      return renderCustomeField(obj, code);
    }

    // 判断维度编码
    switch (String(codeMap[code]?.tag)) {
      case '1':
        return renderSeven(obj, code);
      case '2':
        return renderFive(obj, code);
      case '3':
        return renderPanels(obj, code, showCommon, false);
      case '4':
        return renderFour(obj, code);
      case '5':
        return renderDisaster(obj, code);
      default:
        return renderPanels(obj, code || 'manualCreate', showCommon, true);
    }
  };

  const switchTitle = () => {
    switch (dimensionCode) {
      case 'docOther':
      case 'docDefendant':
      case 'docPlaintiff':
        return intl.get('sdat.riskControl.view.modalTitle.docOther').d('裁判文书详情');

      case 'announceOther':
      case 'announceDefendant':
      case 'announcePlaintiff':
        return intl.get('sdat.riskControl.view.modalTitle.announceOther').d('法院公告详情');

      case 'noticeOther':
      case 'noticeDefendant':
      case 'noticePlaintiff':
        return intl.get('sdat.riskControl.view.modalTitle.noticeOther').d('开庭公告详情');

      default:
        return '';
    }
  };

  const handleOpenIframe = (htmlContent) => {
    const reg1 = htmlContent?.replace(/<a/g, '<span');
    const reg2 = reg1?.replace(/<\/a>/g, '</span>');

    const modalTitle = switchTitle();

    Modal.open({
      title: modalTitle,
      key: iframeKey,
      drawer: true,
      style: { width: '60%' },
      footer: (okBtn) => okBtn,
      okText: intl.get('sdat.eventStuff.view.button.close').d('关闭'),
      closable: false,
      mask: true,
      children: (
        <>
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: reg2 }} className={style['html-box']} />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 200px)',
              }}
            >
              <div style={{ textAlign: 'center', height: '40px' }}>
                <NoContent style={{ width: '40px', height: '40px' }} />
              </div>
              <div className={style['chart-no-content-message']}>
                {intl.get('hzero.common.message.data.none').d('暂无数据')}
              </div>
            </div>
          )}
        </>
      ),
    });
  };

  const openEventUrl = () => {
    if (dimensionCode && detail.Id) {
      getNewsContent({
        indexCode: dimensionCode,
        detailId: detail.Id,
      }).then((res) => {
        if (getResponse(res)) {
          handleOpenIframe(res?.content, detail);
        }
      });
    }
  };

  const switchContent = (item, type, classes) => {
    // 裁判文书 法院公告 开庭公告
    const typeArr = [
      'docOther',
      'docDefendant',
      'docPlaintiff',
      'announceOther',
      'announceDefendant',
      'announcePlaintiff',
      'noticeOther',
      'noticeDefendant',
      'noticePlaintiff',
    ];

    if (item.fieldName === 'eventLevel') {
      return <Tag className={classes}>{item?.value ?? ''}</Tag>;
    }

    if (item.fieldName === 'eventName' && typeArr.includes(type)) {
      return <a onClick={() => openEventUrl(item)}>{item?.value ?? ''}</a>;
    }

    if (item.fieldName === 'scopeType') {
      return <span>{scopeMap[item?.value]}</span>;
    }

    return item?.value ?? '-';
  };

  /**
   * renderPanels: 迭代生成节点
   * @param {*} obj
   * @param {*} intlPrompt
   * @returns
   */
  // eslint-disable-next-line no-unused-vars
  const renderPanels = (obj = {}, intlPrompt, flag, showManual = false) => {
    if (!obj) return;
    // 先按照值的类型进行数据项的分离
    const keys = Object.keys(obj);
    const commonArr = [];
    const arrArr = [];
    let eventTitleStr = '';
    // let descTitleStr = '';

    keys.forEach((item) => {
      if (obj[item] instanceof Array && obj[item].length) {
        arrArr.push({
          key: item,
          value: obj[item],
        });
      } else if (obj[item] instanceof Object) {
        arrArr.push({
          key: item,
          value: [obj[item]],
        });
      } else {
        commonArr.push({
          key: item,
          value: obj[item],
        });
        if (item === 'manualEventName') {
          eventTitleStr = obj[item] || '';
        }
      }
    });

    // 渲染当前obj下的普通字符项
    return (
      <>
        <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
          {intlPrompt === 'manualCreate' ? (
            <Output
              key="manualEventName"
              label={intl.get(`sdat.eventStuff.manualCreate.manualEventName`)}
              value={eventTitleStr}
            />
          ) : null}

          {flag
            ? localFields.map((item) => {
                const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';

                const content = switchContent(item, dimensionCode, classNames);

                if (item.fieldName === 'scopeType') {
                  return null;
                }

                return item.value ? (
                  <Output key={item.u_id} label={item.label} value={content} />
                ) : null;
              })
            : null}
          {commonArr.map((arrItem) => {
            // 先检查是否为id和keyNo
            if (
              [
                'id',
                'riskItemCode',
                'dataSource',
                'dimension',
                'riskCode',
                'creationDate',
                'stdSeqNo',
                'createdBy',
                'lastUpdatedBy',
                'objectVersionNumber',
                '_token',
                'eventSource',
                'status',
                'manualFlag',
                'manualEventName',
                'Content',
                'lastUpdateDate',
                'riskEventId',
                'tenantId',
                'riskPlanId',
                'companyId',
                'supplierCompanyId',
                'responsePersonFlag',
                'planNumber',
                'scopeType',
              ].includes(arrItem?.key)
            ) {
              return <></>;
            }

            const titleIntl = intl
              .get(`sdat.eventStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
              .d(arrItem?.key ?? '');

            const title = renderValue(
              arrItem?.value ?? '-',
              arrItem?.key ?? '',
              intlPrompt,
              'value'
            );

            // 只有多语言存在的数据才能显示
            return intlMapObj[`sdat.eventStuff.${intlPrompt}.${arrItem?.key ?? ''}`] &&
              !(
                ['news', 'negativeNews', 'neutralNews'].includes(intlPrompt) &&
                ['EnterpriseName', 'SocialCode'].includes(arrItem?.key ?? '')
              ) ? (
                <Output key={uuid()} label={titleIntl} value={title} />
            ) : null;
          })}
          {arrArr?.map((arrItem) => {
            if (['responsibleUser', 'relationUser'].includes(arrItem?.key)) {
              const titleIntl = intl
                .get(`sdat.eventStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
                .d(arrItem?.key ?? '');

              const nameList = arrItem?.value?.length
                ? arrItem?.value.map((item) => item.realName)
                : [];
              const nameStr = nameList.length ? nameList.join(',') : '-';
              return <Output key={uuid()} label={titleIntl} value={nameStr} />;
            } else return null;
          })}
        </Form>

        {arrArr?.map((arrItem) => {
          if ((arrItem?.value ?? null) instanceof Array) {
            if (!arrItem.value.length) {
              return null;
            }

            let hidden = false;
            const para = arrItem.value && arrItem.value.length ? arrItem.value[0] : null;
            const keyList = Object.keys(para);
            if (keyList.length) {
              keyList.forEach((keyCode) => {
                if (para[keyCode] instanceof Object && Object.keys(para[keyCode]).length) {
                  hidden = true;
                }
              });
            }

            return ['responsibleUser', 'relationUser'].includes(arrItem?.key)
              ? null
              : intlMapObj[`sdat.eventStuff.${intlPrompt}.${arrItem?.key ?? ''}`] && (
              <>
                <div
                  className={style['second-level-title']}
                  style={{ display: hidden ? 'none' : 'block' }}
                >
                  <div className={style['second-level-title-flag']} />
                  <span>
                    {intl
                          .get(`sdat.eventStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
                          .d(arrItem?.key ?? '')}
                  </span>
                </div>
                {arrItem?.value?.map((arrItemItem) => {
                      return renderPanels(
                        arrItemItem ?? {},
                        `${intlPrompt}.${arrItem?.key ?? ''}`,
                        ''
                      );
                    })}
              </>
                );
          }

          return ['responsibleUser', 'relationUser'].includes(arrItem?.key) ? null : intlMapObj[
              `sdat.eventStuff.${intlPrompt}.${arrItem?.key ?? ''}`
            ] ? (
              <>
                <div className={style['second-level-title']}>
                  <div className={style['second-level-title-flag']} />
                  <span>
                    {intl
                    .get(`sdat.eventStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
                    .d(arrItem?.key ?? '')}
                  </span>
                </div>
                {renderPanels(arrItem?.value ?? {}, `${intlPrompt}.${arrItem?.key ?? ''}`, '')}
              </>
          ) : null;
        })}
      </>
    );
  };

  /**
   * renderValue: 抽象一个渲染表单值的方法
   * @param {*} value
   * @returns
   */
  const renderValue = (value, code, type, tag) => {
    if (['1', 1, 'true'].includes(value)) return intl.get('sdat.eventStuff.view.item.yes').d('是');
    if ([('0', 0, 'false')].includes(value)) {
      return intl.get('sdat.eventStuff.view.item.no').d('否');
    }
    if (!value) return '-';

    if (code === 'EmotionType') {
      // 情感类型
      return emotionMap[value] || '';
    }

    if (code === 'Category') {
      // 类别
      return categoryMap[value] || '';
    }

    if (code === 'RoleType') {
      // 角色类型
      return roleTypeMap[value] || '';
    }

    // 裁判文书 法院公告 开庭公告
    if (
      [
        'docOther',
        'docDefendant',
        'docPlaintiff',
        'announceOther',
        'announceDefendant',
        'announcePlaintiff',
        'noticeOther',
        'noticeDefendant',
        'noticePlaintiff',
      ].includes(type) &&
      code === 'Titlexxx'
    ) {
      return tag === 'value' ? <a onClick={openEventUrl}>{value}</a> : value;
    }

    return value;
  };

  /**
   * 生成第四种详情信息
   */
  const renderFour = (obj = {}) => {
    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        {showCommon
          ? localFields.map((item) => {
              const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';

              const content =
                item.fieldName === 'eventLevel' ? (
                  <Tag className={classNames}>{item?.value ?? ''}</Tag>
                ) : (
                  item?.value ?? ''
                );

              if (item.fieldName === 'scopeType') {
                const scopeTypeVal = detail?.companyName
                  ? `${scopeMap[item?.value] || ''}-${detail?.companyName}`
                  : `${scopeMap[item?.value] || ''}`;
                return <Output key={item.u_id} label={item.label} value={scopeTypeVal} />;
              }

              return <Output key={item.u_id} label={item.label} value={content} />;
            })
          : null}

        <Output
          key={uuid()}
          label={intl.get('sdat.eventStuff.view.title.result').d('计算结果')}
          value={obj?.calculateResult ?? ''}
        />
      </Form>
    );
  };

  /**
   * 二开风险项
   * @param {*} obj
   * @returns
   */
  const renderCustomeField = (obj = {}) => {
    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        {showCommon
          ? localFields.map((item) => {
              const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';
              const content =
                item.fieldName === 'eventLevel' ? (
                  <Tag className={classNames}>{item?.value ?? ''}</Tag>
                ) : (
                  item?.value ?? ''
                );

              if (item.fieldName === 'scopeType') {
                return null;
              }
              return <Output key={item.u_id} label={item.label} value={content} />;
            })
          : null}

        <Output
          key={uuid()}
          label={intl.get('sdat.eventStuff.view.title.riskValueStr').d('风险值')}
          value={obj?.calculateResult ?? ''}
        />
      </Form>
    );
  };

  /**
   * 生成第五种详情信息
   */
  const renderFive = (obj = {}) => {
    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        {showCommon
          ? localFields.map((item) => {
              const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';
              const content =
                item.fieldName === 'eventLevel' ? (
                  <Tag className={classNames}>{item?.value ?? ''}</Tag>
                ) : (
                  item?.value ?? ''
                );

              if (item.fieldName === 'scopeType') {
                return null;
              }

              return <Output key={item.u_id} label={item.label} value={content} />;
            })
          : null}

        <Output key={uuid()} label={obj?.type ?? ''} value={obj?.basicInfo ?? ''} />
      </Form>
    );
  };

  /**
   * 生成第七种详情信息
   */
  const renderSeven = (obj = {}) => {
    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        {showCommon
          ? localFields.map((item) => {
              const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';
              const content =
                item.fieldName === 'eventLevel' ? (
                  <Tag className={classNames}>{item?.value ?? ''}</Tag>
                ) : (
                  item?.value ?? ''
                );

              if (item.fieldName === 'scopeType') {
                return null;
              }
              return <Output key={item.u_id} label={item.label} value={content} />;
            })
          : null}

        <Output
          key={uuid()}
          label={intl.get('sdat.eventStuff.SCOPE_OF_BUS.beforeInfo').d('变更前')}
          value={obj?.stdBeforeContent ?? ''}
        />

        <Output
          key={uuid()}
          label={intl.get('sdat.eventStuff.SCOPE_OF_BUS.afterInfo').d('变更后')}
          value={obj?.stdAfterContent ?? ''}
        />
      </Form>
    );
  };

  /**
   * 生成灾害风险详情信息
   */
  const renderDisaster = (obj = {}) => {
    const commonField = [
      'type',
      'country',
      'province',
      'source',
      'measureValue',
      'measureUnit',
      'longitude',
      'latitude',
      'depth',
      'startDate',
      'endDate',
      'durationTime',
    ];

    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        {showCommon
          ? localFields.map((item) => {
              const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';
              const content =
                item.fieldName === 'eventLevel' ? (
                  <Tag className={classNames}>{item?.value ?? ''}</Tag>
                ) : (
                  item?.value ?? ''
                );

              if (item.fieldName === 'scopeType') {
                return null;
              }

              return <Output key={item.u_id} label={item.label} value={content} />;
            })
          : null}

        {commonField.map((item) => {
          return obj[item] ? (
            <Output
              key={uuid()}
              label={intl.get(`sdat.eventStuff.disasterRisk.${item}`)}
              value={obj[item]}
            />
          ) : null;
        })}
      </Form>
    );
  };

  return (
    <div className={style['common-fields-basic']}>
      <div>{renderTree(detail, dimensionCode)}</div>
    </div>
  );
};

export default CommonDetail;
