const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'src/uploads/products';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (!ext) ext = '.png'; // Default to png if missing (common in Flutter Web)
        cb(null, Date.now() + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith('image/');
        const isOctetStream = file.mimetype === 'application/octet-stream';

        if (isImage || isOctetStream) {
            return cb(null, true);
        } else {
            cb(new Error('Images Only!'));
        }
    }
});


module.exports = upload;
