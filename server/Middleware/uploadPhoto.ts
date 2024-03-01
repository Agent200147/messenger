import multer from 'multer'
import path from "path"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'userAvatarPhotos/'); // Папка, куда сохранять файлы
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Уникальное имя файла
    }
})

const upload = multer({ storage: storage });
export const uploadMiddleware =  upload.single('photo')