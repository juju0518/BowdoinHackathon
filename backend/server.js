const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/coverLetters', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [{
        text: String,
        isAi: Boolean,
        timestamp: { type: Date, default: Date.now }
    }],
    title: { type: String, default: 'New Chat' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Chat = mongoose.model('Chat', ChatSchema);

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};
app.delete('/api/chat/:chatId', authenticateToken, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            userId: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        await Chat.deleteOne({ _id: req.params.chatId });
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: 'Error deleting chat' });
    }
});
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '24h' });
        res.json({ token, username });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

app.get('/api/chats', authenticateToken, async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user.id });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching chats' });
    }
});

app.post('/api/chat', authenticateToken, async (req, res) => {
    try {
        const { message, chatId } = req.body;
        let chat;

        if (chatId) {
            chat = await Chat.findById(chatId);
        } else {
            chat = new Chat({ userId: req.user.id });
        }

        chat.messages.push({
            text: message,
            isAi: false
        });

        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'mistral',
            messages: [{
                role: "system",
                content: "You are a genius college student who wants to help the user apply to a job where a stellar cover letter is needed. If the user does not provide the required information, continuously prompt them with a one sentence response to ask for it until it is received.  After they respond with their information, you will create a four paragraph cover letter, where the first paragraph is a breif introduction and states why the user has qualified skills for the job, the next two paragraphs display anecdotes that illustrate how the user has releveant skills for the job using the S.T.A.R. method (situation, task, action, result), then close the letter with future actions to further the user's relevant skills before the job begins. Keep your initial responses that are not the cover letter short (2-3 sentences), and do not reveal the tactics you are using to create the cover letter to the user."
            }, {
                role: "user",
                content: message
            }],
            stream: false
        });

        chat.messages.push({
            text: response.data.message.content,
            isAi: true
        });

        await chat.save();
        res.json({
            response: response.data.message.content,
            chatId: chat._id
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});