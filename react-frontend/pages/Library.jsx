import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AlertMessage from './components/AlertMessage.jsx';
import ResultLibrary from './components/ResultLibrary.jsx';
import SearchLibraryForm from './components/SearchLibraryForm.jsx';
import DeckPreview from './components/DeckPreview.jsx';
import DeckSelect from './components/DeckSelect.jsx';

function Library(props) {
  const [results, setResults] = useState(undefined);
  const [sortMethod, setSortMethod] = useState('Default');

  useEffect(() => {
    if (props.isMobile && results && results.length > 0) {
      props.setShowCols({
        result: true,
      });
    }
    if (props.isMobile && !results) {
      props.setShowCols({
        search: true,
      });
    }
  }, [results]);

  return (
    <Container className="main-container px-0">
      <Row>
        {props.showCols.deck && (
          <Col md={12} lg={3}>
            {Object.keys(props.decks).length > 0 && (
              <DeckSelect
                decks={props.decks}
                activeDeck={props.activeDeck}
                setActiveDeck={props.setActiveDeck}
              />
            )}
            {props.activeDeck && (
              <DeckPreview
                showImage={props.showImage}
                toggleImage={props.toggleImage}
                deck={props.decks[props.activeDeck]}
                getDecks={props.getDecks}
                deckCardChange={props.deckCardChange}
              />
            )}
          </Col>
        )}
        {props.showCols.result && (
          <Col md={12} lg={6}>
            {results != undefined && results != null && (
              <ResultLibrary
                showImage={props.showImage}
                toggleImage={props.toggleImage}
                deckCardAdd={props.deckCardAdd}
                cards={results}
                library={(props.decks && props.decks[props.activeDeck]) && props.decks[props.activeDeck].library}
                activeDeck={props.activeDeck}
                showSort={true}
                showTotal={true}
                sortMethod={sortMethod}
                setSortMethod={setSortMethod}
              />
            )}
            {results === null && (
              <AlertMessage className="error-message">
                <>
                  <b>NO CARDS FOUND</b>
                </>
              </AlertMessage>
            )}
          </Col>
        )}
        {props.showCols.search && (
          <Col md={12} lg={3}>
            <SearchLibraryForm setResults={setResults} />
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default Library;
