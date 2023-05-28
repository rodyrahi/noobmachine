const express = require("express")
const app = express()
const fs = require('fs');
const multer = require('multer');
var con = require("./database.js");
const path = require('path');
const { auth } = require('express-openid-connect');
var isWin = process.platform === "win32";
const tf = require('@tensorflow/tfjs-node');

  


var baseurl = 'http://localhost:3333'
if (!isWin) {
  baseurl = 'http://noobmachine.hellosugar.io'

}

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: baseurl,
  clientID: 'maQKj7y5gWzTyJ7Zjand8yvXKP63tBqq',
  issuerBaseURL: 'https://dev-t42orpastoaad3st.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const userNickname = req.oidc.user.nickname;
      const destinationPath = `public/uploads/models/${userNickname}`;
  
      // Create the folder if it doesn't exist
      if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
      }
  
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({ storage });

function executeQuery(query) {
    return new Promise((resolve, reject) => {
      con.query(query, (err, result, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }



app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.static("public"));





app.get("/", (req, res) => {
    const name = req.oidc.user.nickname;
    
  res.render("home",{isAuthenticated: req.oidc.isAuthenticated() ,  name:name});
});
    
app.get("/test", (req, res) => {

res.render("test");

  
});
app.post("/model", (req, res) => {

  res.json('hello');
  
});

app.post("/savemodel", upload.fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }]), async (req, res) => {
  const gid = req.oidc.user.sub;
  const files = req.files;

  console.log(req.body);
  const{xsmean,xsstd,ysmean,ysstd}=req.body

  try {
    for (const fieldName in files) {
      const uploadedFile = files[fieldName][0];
      console.log('file');
      con.query(`INSERT INTO clients (gid, models,xsmean,xsstd,ysmean,ysstd , nickname) VALUES ('${gid}', '${uploadedFile.originalname}','${xsmean}','${xsstd}','${ysmean}','${ysstd}','${req.oidc.nickname}');`);
    
    
    }

    res.redirect('/');
  } catch (error) {

  }
});

app.get("/:name/:parameters", async (req, res) => {

  const api = req.params.name
  
  const parameters = req.params.parameters
  parameters = JSON.parse(parameters)

  const result = await executeQuery(`SELECT xsmean,xsstd,ysmean,ysstd,models,nickname FROM clients WHERE api='${api}'`)
  console.log(result[0]);
  const modelPath = 'file://public/uploads/models/'+result[0].nickname+'/'+result[0].models;
  const model = await tf.loadLayersModel(modelPath);

  const normalizedInput = tf.div(tf.sub(tf.tensor1d(parameters), result[0].xsmean), result[0].xsstd);
        
  // Predict the price
  const normalizedPrediction = model.predict(normalizedInput.reshape([1, inputs.length]));
  const denormalizedPrediction = tf.mul(normalizedPrediction, result[0].ysstd).add( result[0].ysmean);
  const price = denormalizedPrediction.dataSync()[0];
    // Use the model for inference or further operations.

  res.json(price)


});
  





  
app.listen(3333)