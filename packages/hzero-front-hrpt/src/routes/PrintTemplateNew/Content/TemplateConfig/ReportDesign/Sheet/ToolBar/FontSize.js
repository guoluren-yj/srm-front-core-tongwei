import React, { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import classnames from 'classnames';
import { Dropdown, Menu } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';

import styles from '../../index.less';
import Store from '../../store';

export default function FontSize({ cell, item, sheetRef, disabled }) {
  const { title, options } = item;
  const { selectRange } = useContext(Store).store;
  const [value, setValue] = useState(10);
  // 未知原因使用dropdown组件会在点击非空单元格时出现下拉列表未收起情况，故使用key临时解决该问题
  const [dropdownKey, setDropdownKey] = useState();
  useEffect(() => {
    if (item.name === "fontSize" && sheetRef.current) {
      const { data } = sheetRef.current.getAllSheets()[0];
      let cols = 0;
      // 整列
      let isAllRow = false;
      // 整行
      let isAllCol = false;
      if (!selectRange || !selectRange[0]) return;
      if (data && data[0] && data[0].length) cols = data[0].length;
      const [colSt, colEnd] = selectRange[0].column;
      const [rowSt, rowEnd] = selectRange[0].row;
      if (colSt === 0 && colEnd + 1 === cols) {
        isAllCol = true;
      }
      if (data && rowSt === 0 && rowEnd + 1 === data.length) {
        isAllRow = true;
      }
      if (isAllCol || isAllRow) setValue(10);
      else if (data && data[rowSt] && data[rowSt][colSt]){
        setValue(Number(data[rowSt][colSt].fs || 10));
      }
    }
    setDropdownKey(new Date().valueOf());
  }, [selectRange]);

  const changeItem = useCallback((clickItem) => {
    setValue(clickItem.key);
    sheetRef.current.updateFormat('fs', clickItem.key);
  }, []);

  const onInputValue = useCallback((e) => {
    let newValue = e.target.value || "";
    if (newValue) newValue = Number(e.target.value);
    if (newValue && isNaN(newValue)) return;
    else if (newValue !== "" && newValue <= 0) newValue = 1;
    else if (newValue > 80) newValue = 80;
    setValue(newValue);
    if (newValue) {
      sheetRef.current.updateFormat('fs', newValue);
    }
  }, []);

  const onInputBlur = useCallback((e) => {
    let newValue = e.target.value || "";
    if (!newValue) newValue = 5;
    setValue(newValue);
    if (newValue) {
      sheetRef.current.updateFormat('fs', newValue);
    }
  }, []);
  const menu = useMemo(
    () => (
      <Menu
        className={classnames(
          styles['sheet-toolbar-dropdown-menu'],
          styles['sheet-toolbar-fontSize-dropdown-menu']
        )}
        onClick={changeItem}
      >
        {options.map((option) => (
          <Menu.Item key={option} className={styles['sheet-toolbar-dropdown-menu-item']}>
            <span style={{ width: '20px' }}>
              {Number(value) === Number(option) && (
                <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
              )}
            </span>
            {option}
          </Menu.Item>
        ))}
      </Menu>
    ),
    [changeItem, options, cell, value]
  );

  return (
    <Dropdown key={dropdownKey} overlay={menu} trigger={['click']} disabled={disabled}>
      <Tooltip title={title}>
        <div
          className={classnames(
            styles['sheet-toolbar-dropdown-item'],
            styles['sheet-toolbar-font-size'],
            { [styles['sheet-toolbar-diabled']]: disabled }
          )}
        >
          <input value={value} onChange={onInputValue} onBlur={onInputBlur} onClick={preventEvent} />
          <Icon type="arrow_drop_down" style={{ fontSize: '18px', fontWeight: 600 }} />
        </div>
      </Tooltip>
    </Dropdown>
  );
}

function preventEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}