const validator = require('validator');

/**
 * Athugar hvort strengur sé "tómur", þ.e.a.s. `null`, `undefined`.
 *
 * @param {string} s Strengur til að athuga
 * @returns {boolean} `true` ef `s` er "tómt", annars `false`
 */
function isEmpty(s) {
  return s == null && !s;
}

/**
 * Staðfestir að verkefni sé gilt.
 *
 * @param {Project} project Project item til að staðfesta
 * @param {boolean} patching Satt ef uppfæring á sér stað, annars ósatt
 * @returns {array} Fylki af villum sem komu upp, tómt ef engin villa
 */
function validate({ title, due, position, completed } = {}, patching) {
  const errors = [];

  if (patching && isEmpty(title) && isEmpty(due) && isEmpty(position) && isEmpty(completed)) {
    errors.push({
      error: 'Vantar gildi til að uppfæra',
    });
  }

  if (!isEmpty(title) || !patching) {
    if (typeof title !== 'string' || title.length < 0 || title.length > 128) {
      errors.push({
        field: 'title',
        message: 'Titill verður að vera strengur sem er 1 til 128 stafir',
      });
    }
  }

  if (!isEmpty(due)) {
    if (!validator.isISO8601(due)) {
      errors.push({
        field: 'due',
        message: 'Dagsetning verður að vera gild ISO 8601 dagsetning',
      });
    }
  }

  if (!isEmpty(position)) {
    if (!Number.isInteger(Number(position)) || Number(position) < 0) {
      errors.push({
        field: 'position',
        message: 'Staðsetning verður að vera heiltala stærri eða jöfn 0',
      });
    }
  }

  if (!isEmpty(completed)) {
    if (typeof completed !== 'boolean') {
      errors.push({
        field: 'completed',
        message: 'Lokið verður að vera boolean gildi',
      });
    }
  }

  return errors;
}

module.exports = {
  validate,
};
