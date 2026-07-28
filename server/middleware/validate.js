 /* A single reusable middleware factory — pass any Zod schema in,
 get back an Express middleware function that validates req.body
 against it. */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Flatten Zod's error format into a simple list of messages
      const errors = result.error.issues.map((issue) => issue.message);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Replace req.body with the parsed/validated data —
    // guarantees the controller only ever sees clean data.
    req.body = result.data;
    next();
  };
}