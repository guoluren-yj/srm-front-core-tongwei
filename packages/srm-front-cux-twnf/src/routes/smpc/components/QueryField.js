import React, { useState, useEffect } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';

export default function QueryField(props) {
  const { placeholder, name, dataSet, style = {}, onRef = (e) => e } = props;

  const [value, setValue] = useState([]);

  useEffect(() => {
    onRef({ handleClear });
    const initVal = dataSet.getQueryParameter(name);
    setValue(initVal);
  }, []);

  function handleClear() {
    setValue(null);
    dataSet.setQueryParameter(name, null);
  }

  function handleQueryChange(val) {
    setValue(val);
    dataSet.setQueryParameter(name, val);
    dataSet.query();
  }

  return (
    <TextField
      value={value}
      clearButton
      style={{ width: 300, ...style }}
      placeholder={placeholder}
      prefix={<Icon type="search" />}
      onChange={handleQueryChange}
    />
  );
}
