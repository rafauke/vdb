import React from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import SortDown from '../../assets/images/icons/sort-down.svg';

function ResultLibrarySortForm(props) {
  const sortMethods = ['Default', 'Name', 'Clan', 'Discipline', 'Type'];

  const SortButtonOptions = sortMethods.map((i, index) => {
    return (
      <Dropdown.Item key={index} href="" onClick={() => props.onChange(i)}>
        Sort by {i}
      </Dropdown.Item>
    );
  });

  return (
    <DropdownButton
      variant="outline-secondary"
      id="sort-button"
      title={<SortDown />}
    >
      {SortButtonOptions}
    </DropdownButton>
  );
}

export default ResultLibrarySortForm;
