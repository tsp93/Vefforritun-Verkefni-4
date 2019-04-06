const xss = require('xss');
const { query } = require('./db');
const { validate } = require('./validate');

/**
 * Sækir verkefni eftir staðsetningu.
 *
 * @param {string} order Hækkandi eða lækkandi röð
 * @param {boolean} completed Satt/ósatt biður aðeins um lokin/ólokin verkefni
 * @returns {array} Fylki með verkefnum
 */
async function getProjects({ order = 'asc', completed = null }) {
  let ascOrDesc = 'ASC';
  if (order === 'desc') {
    ascOrDesc = 'DESC';
  }
  let completeQuery = '';
  if (completed != null) {
    completeQuery = completed ? 'WHERE completed = true ' : 'WHERE completed = false ';
  }

  const result = await query(`SELECT * FROM projects ${completeQuery}ORDER BY position ${ascOrDesc}`);

  return result.rows;
}

/**
 * Sækir stakt verkefni.
 *
 * @param {number} id Id á verkefni
 * @returns {object} Hlutur með verkefni
 */
async function getProject(id) {
  const result = await query(`SELECT * FROM projects WHERE id = ${id}`);

  return result.rows[0];
}

/**
 * Býr til nýtt verkefni.
 *
 * @param {number} id Id á verkefni
 * @returns {object} Hlutur með verkefni
 */
async function createProject(title, due, position) {
  const validation = validate({ title, due, position }, false);
  if (validation.length > 0) {
    return {
      success: false,
      validation,
    };
  }

  const fields = [
    title ? 'title' : null,
    due ? 'due' : null,
    position ? 'position' : null,
  ]
    .filter(Boolean);

  const values = [
    title ? xss(title) : null,
    due,
    position ? Number(position) : null,
  ]
    .filter(Boolean);

  let fieldString = 'title';
  let valueString = '$1';
  for (let i = 1; i < values.length; i += 1) {
    fieldString = `${fieldString}, $${fields[i]}`;
    valueString = `${valueString}, $${i}`;
  }

  const SQLquery = `
  INSERT INTO projects (${fieldString})
  VALUES (${valueString})
  RETURNING *`;

  const result = await query(SQLquery, values);

  return {
    success: true,
    validation: [],
    item: result.rows[0],
  };
}

/**
 * Uppfærir verkefni.
 *
 * @param {number} id Id á verkefni
 * @param {string} title Titill á verkefni
 * @param {string} due Loka dagsetning verkefnis
 * @param {number} position Staðsetning á verkefni
 * @param {boolean} completed Hvort verkefni sé lokið eða ekki
 * @returns {object} Hlutur með uppfært verkefni
 */
async function updateProject(id, { title, due, position, completed }) {
  const validation = validate({ title, due, position, completed }, true);
  if (validation.length > 0) {
    return {
      success: false,
      validation,
    };
  }

  const result = await query(`SELECT * FROM projects WHERE id = ${id}`);
  if (result.rows.length === 0) {
    return {
      success: false,
      notFound: true,
      validation: [],
    };
  }

  const fields = [
    title ? 'title' : null,
    due ? 'due' : null,
    position ? 'position' : null,
    completed ? 'completed' : null,
    'updated',
  ]
    .filter(Boolean);

  const values = [
    title ? xss(title) : null,
    due,
    position ? Number(position) : null,
    completed,
    'now()',
  ]
    .filter(Boolean);

  const updates = [id, ...values];

  const updatedQuery = fields.map((field, i) => `${field} = $${i + 2}`);

  const SQLquery = `
    UPDATE projects
    SET ${updatedQuery.join(', ')}
    WHERE id = $1
    RETURNING *`;

  const updateResult = await query(SQLquery, updates);
  return {
    success: true,
    notFound: false,
    validation: [],
    item: updateResult.rows[0],
  };
}

/**
 * Eyðir verkefni.
 *
 * @param {number} id Id á verkefni
 * @returns {object} Hlutur með eydda verkefni
 */
async function deleteProject(id) {
  const result = await query(`DELETE FROM projects WHERE id = ${id} RETURNING *`);

  return result.rows[0];
}

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
