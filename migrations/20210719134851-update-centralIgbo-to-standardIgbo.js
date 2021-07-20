module.exports = {
  async up(db) {
    const collections = ['words', 'wordsuggestions', 'genericwords'];
    return collections.map((collection) => (
      db.collection(collection).updateMany({}, {
        $rename: { isCentralIgbo: 'isStandardIgbo' },
      })
    ));
  },

  async down(db) {
    const collections = ['words', 'wordsuggestions', 'genericwords'];
    return collections.map((collection) => (
      db.collection(collection).updateMany({}, {
        $rename: { isStandardIgbo: 'isCentralIgbo' },
      })
    ));
  },
};
