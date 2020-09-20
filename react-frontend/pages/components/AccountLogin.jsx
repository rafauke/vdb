import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

import AccountRestorePassword from './AccountRestorePassword.jsx';

function AccountLogin(props) {
  const [state, setState] = useState({
    username: '',
    password: '',
  });

  const [showRestore, setShowRestore] = useState(false);

  const handleChange = event => {
    const {name, value} = event.target;
    setState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const loginUser = () => {
    const url = process.env.API_URL + 'login';
    let input = {
      username: state.username,
      password: state.password,
      remember: 'True',
    };

    const options = {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    };

    const fetchPromise = fetch(url, options);

    fetchPromise
      .then(response => response.json())
      .then(data => {
        if (data.error === undefined) {
          props.setUsername(state.username);
        } else {
          console.log('error: ', data.error);
        }
      });
  };

  return (
    <>
      <h6>Login</h6>
      <form>
        <input
          placeholder='Username'
          type='text'
          name='username'
          value={state.username}
          onChange={handleChange}
        />
        <input
          placeholder='Password'
          type='password'
          name='password'
          value={state.password}
          onChange={handleChange}
        />
        <Button variant='outline-secondary' onClick={loginUser}>
          Login
        </Button>
        <Button variant='outline-secondary' onClick={() => setShowRestore(true)}>
          Restore
        </Button>
        { showRestore && state.username &&
          <AccountRestorePassword
            username={state.username}
            show={showRestore}
            setShow={setShowRestore}
          />
        }
      </form>
    </>
  );
}

export default AccountLogin;
