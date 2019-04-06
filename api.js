const express = require('express');

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('./todos');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * Route handler til að sækja verkefni.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {array} Fylki með verkefnum
 */
async function getProjectsRoute(req, res) {
  const { order, completed } = req.query;

  const result = await getProjects({ order, completed });

  return res.status(200).json(result);
}

/**
 * Route handler til að sækja stakt verkefni.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {object} Hlutur með verkefni
 */
async function getProjectRoute(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const result = await getProject(id);

  if (!result) {
    return res.status(404).json({ error: 'Project not found' });
  }

  return res.status(200).json(result);
}

/**
 * Route handler til að búa til verkefni
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {object} Hlutur með verkefninu sem var búið til
 */
async function createProjectRoute(req, res) {
  const { title, due, position } = req.body;

  const result = await createProject(title, due, position);

  if (!result.success && result.validation.length > 0) {
    return res.status(400).json(result.validation);
  }

  return res.status(201).json(result.item);
}

/**
 * Route handler til að uppfæra verkefni
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {object} Hlutur með verkefninu sem var uppfært
 */
async function updateProjectRoute(req, res) {
  const { id } = req.params;
  const { title, due, position, completed } = req.body;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const result = await updateProject(id, { title, due, position, completed });

  if (!result.success && result.validation.length > 0) {
    return res.status(400).json(result.validation);
  }

  if (!result.success && result.notFound) {
    return res.status(404).json({ error: 'Project not found' });
  }

  return res.status(200).json(result.item);
}

/**
 * Route handler til að eyða verkefni
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function deleteProjectRoute(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const result = await deleteProject(id);

  if (!result) {
    return res.status(404).json({ error: 'Project not found' });
  }

  return res.status(200).json();
}


router.get('/', catchErrors(getProjectsRoute));
router.post('/', catchErrors(createProjectRoute));
router.get('/:id', catchErrors(getProjectRoute));
router.patch('/:id', catchErrors(updateProjectRoute));
router.delete('/:id', catchErrors(deleteProjectRoute));
router.get('/favicon.ico', (req, res) => res.status(204));

module.exports = router;
