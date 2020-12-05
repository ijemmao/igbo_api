describe('Homepage', () => {
  before(() => {
    cy.server();
    cy.visit('http://localhost:8000', {
      onBeforeLoad: () => {
        localStorage.setItem('nkowaokwu_welcome_wizard_completed', 'true');
        localStorage.setItem('nkowaokwu_tutorial_guide_completed', 'true');
      },
    });
  });
  it('returns to the homepage', () => {
    cy.get('img#logo').click();
  });

  it('searches and wait for words using igbo', () => {
    const keyword = 'bia';
    cy.searchDictionary(keyword);
    cy.get('[data-test="word"]');
  });

  it('searches and wait for words using english', () => {
    const keyword = 'run';
    cy.searchDictionary(keyword);
    cy.get('[data-test="word"]');
  });

  describe('About', () => {
    it('loads the about page', () => {
      cy.get('a[href="/about"]').click();
      cy.get('h1').contains('About');
    });
  });

  describe('Pagination', () => {
    it('renders the pagination bar', () => {
      const keyword = 'more';
      cy.searchDictionary(keyword);
      cy.get('[data-test="word"]');
      cy.get('[data-test="pagination"]');
    });

    it('doesn\'t render the pagination bar', () => {
      const keyword = '';
      cy.route({
        method: 'GET',
        url: `/api/v1/words?keyword=${keyword}`,
        response: [],
        status: 200,
      }).as('noPaginationBar');
      cy.searchDictionary(keyword);
      cy.get('[data-test="pagination"]').should('not.exist');
    });

    it('selects the default page', () => {
      const keyword = 'word';
      cy.searchDictionary(keyword);
      cy.get('button[aria-current="true"]').contains('1');
    });
  });

  // TODO: remove skip once feature is released in production
  describe.skip('Details', () => {
    it('renders the correct results page from details page', () => {
      const keyword = 'word';
      cy.searchDictionary(keyword);
      cy.get('button[aria-label="Go to page 2"]').click();
      cy.get('a').contains('Details').first().click();
      cy.go('back');
      cy.location('search');
    });

    it('renders the details page', () => {
      const keyword = 'word';
      cy.visit(`http://localhost:8000/word?word=${keyword}`);
      cy.get('h1').contains('Word');
      cy.get('h1').contains('Part of Speech');
      cy.get('h1').contains('Variations');
      cy.get('h1').contains('Definitions');
    });
  });
});
