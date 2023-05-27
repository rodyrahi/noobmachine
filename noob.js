const express = require("express")
const app = express()
const fs = require('fs');
const multer = require('multer');
var con = require("./database.js");
const { auth } = require('express-openid-connect');
const tf = require('@tensorflow/tfjs');
const { parse } = require("querystring");

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3333',
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
    
  res.render("Home",{isAuthenticated: req.oidc.isAuthenticated() ,  name:name});
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
      con.query(`INSERT INTO clients (gid, models,xsmean,xsstd,ysmean,ysstd) VALUES ('${gid}', '${uploadedFile.originalname}','${xsmean}','${xsstd}','${ysmean}','${ysstd}');`);
    
    
    }

    res.redirect('/');
  } catch (error) {

  }
});

app.get("/:parameters", async (req, res) => {

  const parameters = req.params.parameters

console.log(parameters);
const result = await executeQuery(`SELECT xsmean,xsstd,ysmean,ysstd,models FROM clients WHERE gid='${req.oidc.user.sub}'`)
console.log(result[0].models);
const modelurl=parse('uploads/models/'+req.oidc.user.nickname+'/'+result[0].models)


console.log(modelurl);

const model = await tf.loadLayersModel(tf.io.fileSystem(modelurl));

// Prepare the input data for prediction




// const inputData = tf.tensor2d([[90, 11]], [1, 2]);

// Make a prediction
const newInput = tf.div(tf.sub(tf.tensor1d([56,3.3]), result[0].xsmean), result[0].xsstd);
        
// Predict the price
const normalizedPrediction = model.predict(newInput.reshape([1, 2]));
const denormalizedPrediction = tf.mul(normalizedPrediction, result[0].ysStd).add(result[0].ysMean);
const price = denormalizedPrediction.dataSync()[0];

// res.render
  

});
  








  
app.listen(3333)