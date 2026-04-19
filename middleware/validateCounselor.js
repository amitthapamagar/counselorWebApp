/**
 * Validates the request body when creating or updating a counselor.
 * All fields are optional on update (PATCH), but name + university are
 * required on create (POST).
 */
function validateCounselor(requireAll = false) {
  return (req, res, next) => {
    const { name, university, email } = req.body;

    if (requireAll) {
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'name is required' });
      }
      if (!university || !university.trim()) {
        return res.status(400).json({ error: 'university is required' });
      }
    }

    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'email format is invalid' });
    }

    next();
  };
}

module.exports = validateCounselor;
