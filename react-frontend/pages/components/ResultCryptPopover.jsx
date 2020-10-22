import React from 'react';
import { Popover, ListGroup } from 'react-bootstrap';

import ResultCryptClan from './ResultCryptClan.jsx';
import ResultCryptCapacity from './ResultCryptCapacity.jsx';
import ResultCryptGroup from './ResultCryptGroup.jsx';
import ResultCryptDisciplines from './ResultCryptDisciplines.jsx';

function ResultCryptPopover(props) {
  const imgSrc = `${process.env.ROOT_URL}images/cards/${props.card['ASCII Name']
    .toLowerCase()
    .replace(/[\s,:!?'".\-\(\)]/g, '')}${props.card['Adv'] && 'adv'}.jpg`;
  const cardImage = (
    <img className="card-popover" src={imgSrc} alt={props.card['Name']} />
  );

  const Sets = Object.keys(props.card['Set']).map((k, index) => {
    return (
      <span className="ml-2" key={index}>
        {k}:{props.card['Set'][k]}
      </span>
    );
  });

  const Rulings = Object(props.card['Rulings']).map((k, index) => {
    return (
      <ListGroup.Item key={index}>
        {k}
      </ListGroup.Item>
    );
  });

  return (
    <Popover.Content>
      {props.showImage ? (
        <>
          <div className="d-flex flex-nowrap justify-content-between align-items-center">
            <div className="d-flex flex-nowrap align-items-center">
              <div>
                <ResultCryptClan value={props.card['Clan']} />
              </div>
              <div className="pl-2">
                <b>{props.card['Name']}</b>
              </div>
            </div>
            <div className="pl-2">
              <ResultCryptGroup value={props.card['Group']} />
            </div>
          </div>
          <hr />
          {props.card['Card Text']}
          <hr />
          <div className="d-flex align-items-center justify-content-between">
            <ResultCryptDisciplines value={props.card['Disciplines']} />
            <div className="popover-sets">{Sets}</div>
            <ResultCryptCapacity value={props.card['Capacity']} />
          </div>
          { Rulings.length > 0 &&
            <div className="popover-rulings">
              <b>Rulings:</b>
              <ListGroup>
                {Rulings}
              </ListGroup>
            </div>
          }
        </>
      ) : (
        cardImage
      )}
    </Popover.Content>
  );
}

export default ResultCryptPopover;
