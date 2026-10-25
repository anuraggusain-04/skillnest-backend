const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const { sanitizeCoursePayload } = require('../utils/courseValidation');

const buildCourseLookup = (courseId) => Course.findById(courseId);

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' });
    res.json(courses);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course id' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Get single course (public)
router.get('/:id', async (req, res) => {
  try {
    const course = await buildCourseLookup(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course id' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Create course (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const payload = sanitizeCoursePayload(req.body);
    const course = new Course(payload);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.message && err.message.startsWith('Invalid')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
});

// Update course (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const payload = sanitizeCoursePayload(req.body, { update: true });
    const course = await Course.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course id' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.message && err.message.startsWith('Invalid')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
});

// Delete course (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course id' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Enroll in course (logged in user)
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await buildCourseLookup(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyEnrolled = user.enrolledCourses.some((id) => id.toString() === req.params.id);
    if (alreadyEnrolled) {
      return res.status(409).json({ message: 'Already enrolled' });
    }

    user.enrolledCourses.push(course._id);
    await user.save();
    await Course.findByIdAndUpdate(course._id, { $inc: { students: 1 } }, { new: true });

    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course id' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Get enrolled courses (logged in user)
router.get('/user/enrolled', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.enrolledCourses);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
