import React, { useState, useRef, useEffect, useContext } from 'react';
import { FormControl, Modal, Button, Spinner } from 'react-bootstrap';
import ErrorOverlay from './ErrorOverlay.jsx';
import AppContext from '../../context/AppContext';

function DeckImportAmaranth(props) {
  const { getDecks, setActiveDeck } = useContext(AppContext);
  const [deckUrl, setDeckUrl] = useState('');
  const [emptyUrl, setEmptyUrl] = useState(false);
  const [importError, setImportError] = useState(false);
  const refUrl = useRef(null);
  const [idReference, setIdReference] = useState(undefined);
  const [spinnerState, setSpinnerState] = useState(false);

  const getIdReference = () => {
    const url = `${process.env.ROOT_URL}amaranth_ids.json`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => data.error === undefined && setIdReference(data));
  };

  const handleImportButton = () => {
    setImportError(false);

    if (/.*#deck\//.test(deckUrl)) {
      setEmptyUrl(false);
      setSpinnerState(true);

      if (idReference) {
        getDeckFromUrl(deckUrl)
          .then((deck) => importDeckFromAmaranth(deck))
          .then(() => {
            setDeckUrl('');
            setSpinnerState(false);
            props.handleClose();
          })
          .catch((error) => {
            setImportError(true);
            setSpinnerState(false);
          });
      }
    } else {
      setEmptyUrl(true);
    }
  };

  const importDeckFromAmaranth = (deck) => {
    const cards = {};
    Object.keys(deck.cards).map((i) => {
      cards[idReference[i]] = deck.cards[i];
    });

    let newDeckId;
    const url = `${process.env.API_URL}decks/create`;
    const options = {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deckname: deck.title,
        author: deck.author,
        description: deck.description,
        cards: cards,
      }),
    };

    const fetchPromise = fetch(url, options);

    fetchPromise
      .then((response) => response.json())
      .then((data) => (newDeckId = data.deckid))
      .then(() => getDecks())
      .then(() => {
        setActiveDeck({ src: 'my', deckid: newDeckId });
      })

      .catch((error) => setImportError(true));
  };

  const getDeckFromUrl = async (deckUrl) => {
    const url = `${process.env.AMARANTH_API_URL}deck`;
    const id = deckUrl.replace(/.*#deck\//i, '');
    const options = {
      method: 'POST',
      body: `id=${id}`,
    };

    const response = await fetch(url, options).catch((error) =>
      setImportError(true)
    );
    const deck = await response.json();
    return deck.result;
  };

  useEffect(() => {
    if (props.show && !idReference) getIdReference();
  }, [props.show]);

  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      onShow={() => refUrl.current.focus()}
      animation={false}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Import deck from Amaranth Deck URL</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormControl
          placeholder="Amaranth Deck URL e.g. https://amaranth.co.nz/deck#my-best-deck-id"
          className="deck-import mb-3"
          type="text"
          name="url"
          value={deckUrl}
          onChange={(event) => setDeckUrl(event.target.value)}
          ref={refUrl}
        />
        <div className="d-flex justify-content-end">
          {!spinnerState ? (
            <Button variant="outline-secondary" onClick={handleImportButton}>
              Import
            </Button>
          ) : (
            <Button variant="outline-secondary" onClick={handleImportButton}>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              Import
            </Button>
          )}
        </div>
        <ErrorOverlay
          show={emptyUrl}
          target={refUrl.current}
          placement="bottom"
          modal={true}
        >
          ERROR IN URL
        </ErrorOverlay>
        <ErrorOverlay
          show={importError}
          target={refUrl.current}
          placement="bottom"
          modal={true}
        >
          ERROR DURING IMPORT
        </ErrorOverlay>
      </Modal.Body>
    </Modal>
  );
}

export default DeckImportAmaranth;
