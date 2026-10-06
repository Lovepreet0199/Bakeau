//Import multer to receive uploaded files from forms
import multer from "multer";

//Store uploaded files temporarily in memory
const storage = multer.memoryStorage();

//Create reusable upload middleware
const upload = multer({
    storage: storage
});

//Export upload middleware so routes can use it
export default upload;