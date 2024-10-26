// NPM PACKAGES
import express from 'express';
const router = express.Router();

// CUSTOMER MODULES/MIDDLEWARES
import profileSchema from '../joi-schema-validator/profileSchema.js';
import newPasswordSchema from '../joi-schema-validator/newPasswordSchema.js';
import validate from '../middleware/validate.js';
import emailSchema from '../joi-schema-validator/emailSchema.js';
import passwordSchema from '../joi-schema-validator/passwordSchema.js';
import {
    profile,
    updateEmail,
    verifyPassword,
    updatePassword,
    updatePersonalInformation,
    logoutAccount,
    deleteAccount
} from '../controllers/accountController.js';

router.get('/profile', profile);
router.post('/logout', logoutAccount);
router.post('/current-password', validate(passwordSchema), verifyPassword);
router.put('/email', validate(emailSchema), updateEmail);
router.put('/password', validate(newPasswordSchema), updatePassword);
router.put('/personal-info', validate(profileSchema), updatePersonalInformation);
router.delete('/account', deleteAccount);

export default router;