const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const userController = require('../controllers/userController');

router.get('/', authenticate, authorizeRole('admin', 'supervisor'), userController.getAllActiveUsers);
router.get('/activos', authenticate, authorizeRole('admin', 'supervisor'), userController.getOnlineUsersCount);
router.put('/:id', authenticate, authorizeRole('admin'), userController.updateUserRole);
router.delete('/:id', authenticate, authorizeRole('admin'), userController.deactivateUser);
router.post('/activity', authenticate, userController.updateUserActivity);
router.post('/logout', authenticate, userController.logoutUser);
router.post('/logout-inactivos', userController.logoutInactiveUsers);
router.get('/:id/active', userController.checkIfUserIsActive);

module.exports = router;
