const express = require('express'),
path = require('path'),
cors = require('cors'),
getExtension = require('./utils/getExtension.js'),
multer = require('multer'),
fs = require('fs');

//PORT
const PORT = process.env.PORT || 8080;

//init multer storage setting
const storage = multer.diskStorage({
    fileFilter(req,file,cb){
        let ext = getExtension(file.originalname);
        let formats = ['.txt','.doc','.docx'];
        formats.indexOf(ext) !== -1 && cb(null,true)
    },
    destination(req,file,cb){
        let ext = getExtension(file.originalname);
        if(ext == '.txt') cb(null,'txt/')
        else {
          cb(null,'docs')
        }
    },
    filename(req,file,cb){
        cb(null, file.originalname)
    }
});

//upoaded file
const upload = multer({storage});
//main formatter function
const formatter = require('./utils/formatter.js');
//file reader
const reader = require('any-text');

//cleanUp fs
function wipe(dir){
    const files = fs.readdirSync(dir);
    for(file of files){
        fs.unlinkSync(path.join(dir,file))
    }
}

//increment converted files count
function incrementConverted(){
    const count = Number(fs.readFileSync('converted_files_count.txt','utf-8'));
    fs.writeFileSync('converted_files_count.txt',count+1);
}

//init app
const app = express();

//parse url-encoded bodies
app.use(express.urlencoded({extended:true}));

//parse json bodies
//app.use(express.json())

//init cors
app.use(cors({
    "origin": "*",
    "methods":"GET,POST"
}));

//set static folder
app.use('/',express.static(__dirname+'/client/public'));

//index route
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname,'/client/public/index.html'));
});

//upload Route
app.post('/upload',upload.single('file') ,(req, res) => {
    const ext = getExtension(req.file.originalname);

    //format options from client
    const {groupBy = Number(groupBy),countPerLine = Number(countPerLine)} = JSON.parse(req.body.options);

    //file name formatting
    let name = req.file.originalname;
    let filename = path.resolve('txt',name.substring(0,name.lastIndexOf('.'))) + '.txt';

    //do extra conversion if file is .doc or .docx
    if(ext == '.doc' || ext == '.docx'){

        //extract the file content, write it into a new .txt file, and then do the formatting
        reader.getText(req.file.path).then(data => {
            return fs.writeFile(filename,data,(err) => {
                if(err) return Error("Failed Writing to txt");
                formatter(filename,path.resolve('output'),groupBy,countPerLine).then(done => {
                    if(done){
                        wipe('docs');//clear files inside docs
                        wipe('txt');//clear files inside txt
                        incrementConverted();//increment converted files counter
                        res.status(200).send({formatted:true});
                    }
                }).catch(e => res.status(500).end(e));
            });
        }).catch(e => res.status(500).end(e))
    }else{
        formatter(filename,path.resolve('output'),groupBy,countPerLine).then(done => {
            if(done){
                wipe('docs');
                wipe('txt');
                res.status(200).send({formatted:true});
            }else{
                return Error('Failed Processing File')
            }
        }).catch((e) => {
            console.log(e)
            res.status(500).send(e);
        })
    }
});

//Download Endpoint
app.get('/download', (req,res) => {
    res.status(200).header('Content-Type','text/plain').download(path.resolve('output','final.txt'),'converted.txt');
});

//Start Servers
app.listen(PORT, () => {
    console.log('App Listening on '+PORT)
});