'use strict';
const Issue = require('../models/Issue');

module.exports = function (app) {
  app.route('/api/issues/:project')

    // ✅ GET: fetch issues with optional filters
    .get(async function (req, res) {
      const project = req.params.project;
      const filters = { project, ...req.query };

      if ('open' in filters) {
        filters.open = filters.open === 'true';
      }

      try {
        const issues = await Issue.find(filters).exec();
        res.json(issues);
      } catch (err) {
        res.json({ error: 'could not retrieve issues' });
      }
    })

    // ✅ POST: create an issue
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const issue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text
        });
        const saved = await issue.save();
        res.json(saved);
      } catch (err) {
        res.json({ error: 'could not create issue' });
      }
    })

    // ✅ PUT: update an issue
    .put(async function (req, res) {
      const project = req.params.project;
      const { _id, ...fieldsToUpdate } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      // Remove empty fields
      const updateFields = {};
      for (const key in fieldsToUpdate) {
        if (fieldsToUpdate[key] !== '') updateFields[key] = fieldsToUpdate[key];
      }

      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      updateFields.updated_on = new Date();

      try {
        const updated = await Issue.findOneAndUpdate({ _id, project }, updateFields, { new: true });
        if (!updated) throw new Error();
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    // ✅ DELETE: delete an issue
    .delete(async function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      try {
        const deleted = await Issue.findOneAndDelete({ _id, project });
        if (!deleted) throw new Error();
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};
