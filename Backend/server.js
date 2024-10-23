const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
app.use(cors()); // Allow CORS for all origins (adjust if necessary)
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the "public" directory

// Use connection pooling for better database performance
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1012',
    database: 'News',
    connectionLimit: 10
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for handling file uploads (for images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Get all articles
app.get('/api/getArticles', (req, res) => {
    const query = 'SELECT * FROM articles';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching articles:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        console.log('Fetched articles:', results);
        res.json(results);
    });
});

// Create a new article (news/event)
app.post('/api/createArticle', upload.single('image'), (req, res) => {
    if (!req.file) {
        console.error('No image file uploaded.');
        return res.status(400).json({ error: 'Image upload is required' });
    }

    const { title, body, category } = req.body;
    const imageUrl = `/Backend/public/uploads/${req.file.filename}`;
    const deleteImage=`public/uploads/${req.file.filename}`;

    const query = 'INSERT INTO articles (title, body, image_url, delete_url, category) VALUES (?, ?, ?, ?,?)';
    pool.query(query, [title, body, imageUrl,deleteImage, category], (err, result) => {
        if (err) {
            console.error('Error inserting article:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json({ message: 'Article created successfully!' });
    });
});


app.get('/api/getArticle', (req, res) => {
    const articleId = req.query.id;

    if (!articleId) {
        return res.status(400).json({ error: 'Article ID is required' });
    }

    const query = 'SELECT * FROM articles WHERE id = ?';
    pool.query(query, [articleId], (err, result) => {
        if (err) {
            console.error('Error fetching article:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Send the found article
        res.json(result[0]);
    });
});





// Delete an article by ID
app.delete('/api/deleteArticle', (req, res) => {
    const articleId = req.query.id;

    if (!articleId) {
        return res.status(400).json({ error: 'Article ID is required' });
    }

    const selectQuery = 'SELECT * FROM articles WHERE id = ?';
    pool.query(selectQuery, [articleId], (err, result) => {
        if (err || result.length === 0) {
            console.error('Error fetching article:', err);
            return res.status(404).json({ error: 'Article not found' });
        }

        const article = result[0];
        const imagePath = path.join(__dirname, article.delete_url);

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting image file:', err);
            }
        });

        const deleteQuery = 'DELETE FROM articles WHERE id = ?';
        pool.query(deleteQuery, [articleId], (err, result) => {
            if (err) {
                console.error('Error deleting article:', err);
                return res.status(500).json({ error: 'Error deleting article' });
            }
            res.json({ message: 'Article deleted successfully!' });
        });
    });
});

// Add this new route for uploading gallery images
app.post('/api/uploadGalleryImage', upload.single('galleryImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imageUrl = `/Backend/public/uploads/${req.file.filename}`;
    const imageDescription = req.body.imageDescription;

    const query = 'INSERT INTO gallery_images (image_url, description) VALUES (?, ?)';
    pool.query(query, [imageUrl, imageDescription], (err, result) => {
        if (err) {
            console.error('Error inserting gallery image:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json({ message: 'Gallery image uploaded successfully!' });
    });
});

// Add this new route for fetching gallery images
app.get('/api/getGalleryImages', (req, res) => {
    const query = 'SELECT * FROM gallery_images ORDER BY id DESC';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching gallery images:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

// Add this new route for deleting gallery images
app.delete('/api/deleteGalleryImage', (req, res) => {
    const imageId = req.query.id;

    if (!imageId) {
        return res.status(400).json({ error: 'Image ID is required' });
    }

    const selectQuery = 'SELECT * FROM gallery_images WHERE id = ?';
    pool.query(selectQuery, [imageId], (err, result) => {
        if (err || result.length === 0) {
            console.error('Error fetching gallery image:', err);
            return res.status(404).json({ error: 'Gallery image not found' });
        }

        const image = result[0];
        const imagePath = path.join(__dirname, image.image_url);

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting image file:', err);
            }
        });

        const deleteQuery = 'DELETE FROM gallery_images WHERE id = ?';
        pool.query(deleteQuery, [imageId], (err, result) => {
            if (err) {
                console.error('Error deleting gallery image:', err);
                return res.status(500).json({ error: 'Error deleting gallery image' });
            }
            res.json({ message: 'Gallery image deleted successfully!' });
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
