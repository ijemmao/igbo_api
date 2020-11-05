import wordsResponse from '../support/constants';

describe('Word', () => {
  beforeEach(() => {
    cy.server();
    cy.visit('http://localhost:8000');
  });

  describe('Add Word', () => {
    it('renders the add new word modal', () => {
      cy.get('[data-test="add-button"]').click();
      cy.get('[data-test="suggestion-modal"]');
    });

    it('renders the success result view', () => {
      cy.route({
        method: 'POST',
        url: '/api/v1/wordSuggestions',
        response: { id: 'success' },
        status: 200,
      }).as('postWordSuggestion');
      cy.get('[data-test="add-button"]').click();
      cy.get('[data-test="new-word-input"]').type('new word');
      cy.get('[data-test="word-class-input"]').type('new word class');
      cy.get('[aria-label="Add Definition"]').click();
      cy.get('[data-test="definitions-0-input"]').type('first definition');
      cy.get('[aria-label="Add Variation"]').click();
      cy.get('[data-test="variations-0-input"]').type('first variation');
      cy.get('button[type="submit"]').contains('Submit').click();
      cy.wait('@postWordSuggestion');
      cy.get('[data-test="result-success"]');
    });

    it('renders the failure result view', () => {
      cy.route({
        method: 'POST',
        url: '/api/v1/wordSuggestions',
        response: { id: 'success' },
        status: 400,
      }).as('postWordSuggestion');
      cy.get('[data-test="add-button"]').click();
      cy.get('[data-test="new-word-input"]').type('new word');
      cy.get('[data-test="word-class-input"]').type('new word class');
      cy.get('[data-test="definitions-0-input"]').type('first definition');
      cy.get('button[type="submit"]').contains('Submit').click();
      cy.wait('@postWordSuggestion');
      cy.get('[data-test="result-error"]');
    });

    it('clears the data once the modal is closed', () => {
      cy.get('[data-test="add-button"]').click();
      cy.get('[data-test="new-word-input"]').type('new word');
      cy.get('[data-test="word-class-input"]').type('new word class');
      cy.get('[aria-label="Add Definition"]').click();
      cy.get('[data-test="definitions-0-input"]').type('first definition');
      cy.get('[aria-label="Add Variation"]').click();
      cy.get('[data-test="variations-0-input"]').type('first variation');
      cy.get('button').contains('Cancel').click();
      cy.get('[data-test="add-button"]').click();
      cy.get('[data-test="new-word-input"]').should('not.have.value');
      cy.get('[data-test="word-class-input"]').should('not.have.value');
      cy.get('[data-test="definitions-0-input"]').should('not.have.value');
    });

    it('goes back from result view', () => {
      cy.route({
        method: 'POST',
        url: '/api/v1/wordSuggestions',
        response: { id: 'success' },
        status: 400,
      }).as('postWordSuggestion');
      cy.get('[data-test="add-button"]').click();
      cy.get('[data-test="new-word-input"]').type('new word');
      cy.get('[data-test="word-class-input"]').type('new word class');
      cy.get('[data-test="definitions-0-input"]').type('first definition');
      cy.get('button[type="submit"]').contains('Submit').click();
      cy.wait('@postWordSuggestion');
      cy.get('[data-test="result-error"]');
      cy.get('button').contains('Back to Form').click();
      cy.get('[data-test="new-word-input"]');
    });

    it('adds and deletes definitions', () => {
      cy.get('[data-test="add-button"]').click();
      cy.get('[data-test="definitions-0-input"]');
      cy.get('[aria-label="Add Definition"]').click();
      cy.get('[data-test="definitions-1-input"]');
      cy.get('[aria-label="Delete Definition"]').first().click();
      cy.get('[data-test="definitions-1-input"]').should('not.exist');
    });

    it('adds and deletes variations', () => {
      cy.get('[data-test="add-button"]').click();
      cy.get('[aria-label="Add Variation"]').click();
      cy.get('[data-test="variations-0-input"]');
      cy.get('[aria-label="Add Variation"]').click();
      cy.get('[data-test="variations-1-input"]');
      cy.get('[aria-label="Add Variation"]').click();
      cy.get('[data-test="variations-2-input"]');
      cy.get('[aria-label="Delete Variation"]').first().click();
      cy.get('[data-test="variations-3-input"]').should('not.exist');
    });
  });

  describe('Edit Word', () => {
    beforeEach(() => {
      const keyword = 'word';
      cy.searchDictionary(keyword);
      cy.get('[data-test="select-actions"]').first().click();
      cy.contains('Suggest an Edit').click();
    });

    it('pre-populates the form', () => {
      const firstWord = wordsResponse[0];
      cy.get(`[value="${firstWord.word}"]`);
      cy.get(`[value="${firstWord.wordClass}"]`);
      cy.get(`[value="${firstWord.definitions[0]}"]`);
    });
  });

  describe('No word', () => {
    it('renders no word component', () => {
      cy.fixture('constants.json').then(({ NOT_A_WORD }) => {
        cy.searchDictionary(NOT_A_WORD);
        cy.get('[data-test="define-word-button"]');
      });
    });

    it('opens the add word form', () => {
      cy.fixture('constants.json').then(({ NOT_A_WORD }) => {
        cy.searchDictionary(NOT_A_WORD);
        cy.get('[data-test="define-word-button"]').click();
        cy.get(`input[value="${NOT_A_WORD}"]`);
      });
    });
  });
});