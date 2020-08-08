import React from 'react';

function ResultCryptName(props) {
  return (
    <td className='name'>
      <div onClick={() => props.toggleHidden(props.id)}>
        <a href='#'>
          {props.value} {props.adv && ' [ADV]'} {props.ban && ' [BANNED]'}
        </a>
      </div>
    </td>
  );
}

export default ResultCryptName;
