const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/user.controller');
const { createOwner } = require('../controllers/admin.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

router.get('/', auth, authorize('admin'), getUsers);
router.put('/:id', auth, authorize('admin'), updateUser);
router.delete('/:id', auth, authorize('admin'), deleteUser);
router.post('/create-owner', auth, authorize('admin'), createOwner);


module.exports = router;
