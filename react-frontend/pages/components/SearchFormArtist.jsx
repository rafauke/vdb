import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import artists from './artists.js';

function SearchFormArtist(props) {
  const options = artists.map((artist, index) => {
    return (
      {
        name: "artist",
        value: artist,
        label: artist,
      }
    )
  })


  return (
    <Row className="py-1 pl-1 mx-0 align-items-center">
      <Col xs={3} className="d-flex px-0">
        <label className="h6 mb-0">Artist:</label>
      </Col>
      <Col xs={9} className="d-inline px-0">
        <Select
          onChange={props.onChange}
          placeholder="Artist"
          options={options}/>
      </Col>
    </Row>
  );
}

export default SearchFormArtist;