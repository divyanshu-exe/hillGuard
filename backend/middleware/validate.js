const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    const issues = err.issues || err.errors;
    if (issues && Array.isArray(issues) && issues.length > 0) {
      const messages = issues.map((e) => {
        const field = e.path && e.path.length > 0 ? `${e.path.join('.')}: ` : '';
        return `${field}${e.message || 'Invalid input'}`;
      });
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        errors: messages
      });
    }

    let cleanMsg = err.message || 'Validation failed';
    try {
      const parsedIssues = JSON.parse(cleanMsg);
      if (Array.isArray(parsedIssues) && parsedIssues.length > 0) {
        cleanMsg = parsedIssues.map((i) => i.message || 'Invalid input').join(', ');
      }
    } catch {}

    return res.status(400).json({
      success: false,
      message: cleanMsg
    });
  }
};

module.exports = { validate };
