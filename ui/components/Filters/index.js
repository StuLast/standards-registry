import { useState, useEffect } from 'react';
import { useQueryContext } from '../../context/query';
import omit from 'lodash/omit';
import { CheckboxGroup, OptionSelect, Expander, Select } from '../';

import styles from './Filters.module.scss';

function Filter({
  label,
  choices,
  onChange,
  field_name: fieldName,
  open,
  onToggle,
  useSelect,
  numActive = 0,
}) {
  const { query, updateQuery } = useQueryContext();
  const toggle = (e) => {
    e.preventDefault();
    onToggle(fieldName, e.target.open);
  };
  const summary = (
    <p className={styles.filterHeader}>
      {label}

      {!useSelect && <span>{numActive} selected</span>}
    </p>
  );

  function onSelectChange(val) {
    updateQuery({ ...query, [fieldName]: val || [] });
  }

  return useSelect ? (
    <>
      {summary}
      <Select
        options={choices}
        onChange={onSelectChange}
        showAll={true}
        value={query[fieldName] || ''}
      />
    </>
  ) : (
    <Expander
      summary={summary}
      className="nhsuk-filter"
      open={open}
      onToggle={toggle}
    >
      <OptionSelect>
        <CheckboxGroup
          onChange={onChange}
          options={choices}
          parent={fieldName}
          small
        />
      </OptionSelect>
    </Expander>
  );
}

const pick = (names, fields) =>
  names.map((name) => fields.find((val) => val.field_name === name));

export default function Filters({ schema }) {
  const { dataset_fields: fields } = schema;
  const { getSelections, updateQuery } = useQueryContext();
  const [openFilters, setOpenFilters] = useState([]);
  const selections = getSelections();
  const categories = ['care_setting', 'topic', 'standard_category'];
  const filters = pick(categories, fields);

  const addFilter = (filter) => {
    const selections = getSelections();
    for (const key of categories) {
      selections[key] = [
        ...new Set(
          [selections[key]]
            .filter((f) => f)
            .concat([filter[key]].filter((f) => f))
            .flatMap((f) => f)
        ),
      ];
    }
    updateQuery(selections);
  };

  const removeFilter = (filter) => {
    const selections = getSelections();
    for (const key of categories) {
      selections[key] = [
        ...new Set(
          [selections[key]].flatMap((f) => f).filter((i) => i !== filter[key])
        ),
      ];
    }
    updateQuery(selections);
  };

  const setItem = (event) => {
    const { checked, value } = event.target;
    const parent = event.target.getAttribute('parent');
    const filter = { [parent]: value };

    return checked ? addFilter(filter) : removeFilter(filter);
  };

  const setSelections = () => {
    const open = new Set(openFilters);
    for (const filter of filters) {
      const key = filter.field_name;
      const list = selections[key];
      filter.choices.map((choice) => {
        choice.checked = false;
        if (list && list.includes(choice.value)) {
          open.add(key);
          choice.checked = true;
        }
        return choice;
      });
    }
    setOpenFilters([...open]);
  };
  useEffect(setSelections, [selections]);

  const toggle = (name, isOpen) => {
    const open = new Set(openFilters);
    isOpen ? open.add(name) : open.delete(name);
    setOpenFilters([...open]);
  };

  const activeFilters = omit(selections, 'q', 'page', 'sort');

  return (
    <div className="nhsuk-filters">
      <h3>Filters</h3>
      <div className="nhsuk-expander-group">
        {filters.map((filter, index) => {
          let fieldFilters = activeFilters[filter.field_name] || [];
          if (!Array.isArray(fieldFilters)) {
            fieldFilters = [fieldFilters];
          }
          const numActive = fieldFilters.length;
          // TODO: should be set in schema, hack until we change it
          if (filter.label === 'Type of standard') {
            filter.label = 'Type';
          }
          return (
            <Filter
              key={index}
              {...filter}
              open={openFilters.includes(filter.field_name)}
              onChange={setItem}
              onToggle={toggle}
              numActive={numActive}
              // TODO: this should be configured in schema
              useSelect={filter.field_name === 'standard_category'}
            />
          );
        })}
      </div>
    </div>
  );
}
