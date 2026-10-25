const VALID_STATUSES = new Set(['published', 'draft']);
const ALLOWED_FIELDS = [
  'title',
  'description',
  'category',
  'price',
  'instructor',
  'duration',
  'rating',
  'students',
  'image',
  'status'
];

const sanitizeCoursePayload = (input = {}, options = {}) => {
  const { update = false } = options;
  const payload = {};

  for (const field of ALLOWED_FIELDS) {
    if (input[field] !== undefined) {
      payload[field] = input[field];
    }
  }

  if (!update && Object.keys(payload).length === 0) {
    throw new Error('Invalid course payload');
  }

  if (!update) {
    for (const requiredField of ['title', 'description', 'category', 'price', 'instructor']) {
      const value = payload[requiredField];
      if (value === undefined || value === null || String(value).trim() === '') {
        throw new Error(`Invalid course payload: ${requiredField} is required`);
      }
    }
  }

  if (payload.title !== undefined) {
    payload.title = String(payload.title).trim();
    if (!payload.title) throw new Error('Invalid course payload: title is required');
  }

  if (payload.description !== undefined) {
    payload.description = String(payload.description).trim();
    if (!payload.description) throw new Error('Invalid course payload: description is required');
  }

  if (payload.category !== undefined) {
    payload.category = String(payload.category).trim();
    if (!payload.category) throw new Error('Invalid course payload: category is required');
  }

  if (payload.instructor !== undefined) {
    payload.instructor = String(payload.instructor).trim();
    if (!payload.instructor) throw new Error('Invalid course payload: instructor is required');
  }

  if (payload.price !== undefined) {
    const numericPrice = Number(payload.price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      throw new Error('Invalid course payload: price must be a non-negative number');
    }
    payload.price = numericPrice;
  }

  if (payload.students !== undefined) {
    const numericStudents = Number(payload.students);
    if (!Number.isInteger(numericStudents) || numericStudents < 0) {
      throw new Error('Invalid course payload: students must be a non-negative integer');
    }
    payload.students = numericStudents;
  }

  if (payload.rating !== undefined) {
    const numericRating = Number(payload.rating);
    if (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 5) {
      throw new Error('Invalid course payload: rating must be between 0 and 5');
    }
    payload.rating = numericRating;
  }

  if (payload.status !== undefined) {
    const statusValue = String(payload.status).trim();
    if (!VALID_STATUSES.has(statusValue)) {
      throw new Error('Invalid course payload: status must be published or draft');
    }
    payload.status = statusValue;
  }

  if (payload.duration !== undefined) {
    payload.duration = String(payload.duration).trim();
  }

  if (payload.image !== undefined) {
    payload.image = String(payload.image).trim();
  }

  return payload;
};

module.exports = {
  sanitizeCoursePayload,
  ALLOWED_FIELDS,
  VALID_STATUSES
};
