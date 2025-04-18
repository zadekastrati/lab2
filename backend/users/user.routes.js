    const express = require('express');
    const router = express.Router();
    const { registerUser, loginUser,getUserById,updateUser,deleteUser } = require('./user.controller');
    const verifyToken = require('./middleware/jwtMiddleware'); 

    // @route   POST /api/users/register
    router.post('/register', registerUser);

    // @route   POST /api/users/login
    router.post('/login', loginUser);

    const User = require('./user.model'); // Adjust based on your setup

    router.get('/me', verifyToken, async (req, res) => {
        try {
        const userId = req.user.userId; // Get the user ID from the JWT token
        console.log('Decoded userId from token:', userId); // Add this line to verify the userId
        
        // Use Sequelize's findByPk to fetch the user by primary key (id)
        const user = await User.findByPk(userId);
        
        if (!user) {
            console.log('No user found for ID:', userId); // Log if the user is not found
            return res.status(404).json({ message: 'User not found' });
        }
    
        res.status(200).json({ results: user });
        } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    

    router.get('/:id',verifyToken, getUserById);

    router.put('/:id', verifyToken, (req, res) => {
        console.log('Authorization Header:', req.headers['authorization']);
        updateUser(req, res);
    });

    router.delete('/:id',verifyToken, deleteUser);

    module.exports = router;
