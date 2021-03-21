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
          cb(null,'docs/')
        }
    },
    filename(req,file,cb){
        cb(null, String(Math.floor(Math.random() * 999999999)) + file.originalname)
    }
});

//upoaded file
const upload = multer({storage});
//main formatter function
const formatter = require('./utils/formatter.js');
//file reader
const reader = require('any-text');


//increment converted files count
async function incrementConverted(){
    fs.readFile('converted_files_count.txt','utf-8',(err, data) => {
        if(err) console.log("Reading count file failed:\n"+err)
        data = Number(data)+1;
        fs.writeFile('converted_files_count.txt',String(data),(err)=>{
            err && console.log('Error Writing to counts file\n'+err)
        });
    });
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
    "methods":["GET","POST"]
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
    var name = req.file.filename; //make it var to be accessible globally
    console.log('name '+name)
    let nameWithTxt = path.resolve('txt',name.substring(0,name.lastIndexOf('.'))) + '.txt';
    console.log('nameWithText '+nameWithTxt)
    let plainName = name.substring(0,name.lastIndexOf('.'));
    console.log('plainname '+plainName);


    //do extra conversion if file is .doc or .docx
    if(ext == '.doc' || ext == '.docx'){

        (async ()=>{

            //extract the content of the word file and store in a variable
            let wordFileContent = await reader.getText(path.resolve('docs',name)).then(d => d).catch(e => {
                console.log('Couldnt read file '+ name + '\n' +e)
                res.status(500).end(e);
                return false
            });

            //create a new text file and write the word file content into it
            fs.promises.writeFile(nameWithTxt,wordFileContent).then(() => {

                //format the text file and send the name of the formatted file to the client for download
                formatter(plainName, nameWithTxt, path.resolve('output')).then(formatted => {
                    if(formatted){
                        // console.log(plainName)
                        res.status(200).send({convertedFileName:String(plainName+'.txt')});

                        //increment the count for total converted files
                        incrementConverted();
                    }
                }).catch(e => {
                    console.log('Couldnt format file '+ name + '\n' +e)
                    res.status(500).end(e);
                    return false
                })

            }).catch(e => {
                console.log('Couldnt write to file '+ nameWithTxt + '\n' +e)
                res.status(500).end(e);
                return false
            })
        })()

    }else{

        (async ()=>{

            //format the text file and send the name of the formatted file to the client for download
            formatter(plainName, nameWithTxt, path.resolve('output')).then(formatted => {
                if(formatted){
                    res.status(200).send({convertedFileName:String(plainName+'.txt')});

                    //increment the count for total converted files
                    incrementConverted();
                }
            }).catch(e => {
                console.log('Couldnt format file '+ name + '\n' +e)
                res.status(500).end(e);
                return false
            })  
        })()

    }
});

//Download Endpoint
app.get('/download', (req,res) => {
    const files = fs.readdirSync('output');
    if(!req.query.filename){
        res.status(500).send('No FileName Argument Supplied');
        return 
    }

    //decode uri to convert to original file name which corresponds to the one in the file system
    let filename = decodeURIComponent(req.query.filename);
    let desiredName = decodeURIComponent(req.query.desiredName || 'converted.txt');

    if(req.query.filename && files.indexOf(filename) === -1){
        res.status(400).send('No file with such name');
        return
    }

    //send file if it exists in the output directory
    res.status(200).header('Content-Type','text/plain').download(path.resolve('output',filename), desiredName);
});

//Start Servers
app.listen(PORT, () => {
    console.log('App Listening on '+PORT)
});