const express = require("express")
const app = express()
const fs = require('fs');
const multer = require('multer');
var con = require("./database.js");
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const IP = require('ip');
const {  auth, requiresAuth  } = require('express-openid-connect');
var isWin = process.platform === "win32";
const tf = require('@tensorflow/tfjs-node');
const { log } = require("console");

// app.use(requestIp.mw({ attributeName: 'clientIp' }));
const clientIds = new Map();
app.set('trust proxy', true);
var baseurl = 'http://localhost:3333'
if (!isWin) {
  baseurl = 'https://noobmachine.hellosugar.io'

}

app.set('trust proxy' , true)
// app.use(cors())

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

app.use((req, res, next) => {
  // Generate a UUID for the client
  const clientId = uuidv4();

  // Store the client ID in the request object
  req.clientId = clientId;

  // Add the client ID to the map
  clientIds.set(clientId, true);

  next();
});




app.get("/", async (req, res) => {
  
  const clientIP = req.headers['x-real-ip'];
  
  
  console.log(clientIP);
  // Retrieve client's IP address from X-Real-IP header

  if (req.oidc.isAuthenticated()) {
    const name = req.oidc.user.nickname;
    const gid = req.oidc.user.sub;
    console.log(name);
    const credits = await executeQuery(
      `SELECT * FROM clients  WHERE gid='${gid}'`
    );
    console.log(credits);
    if (credits.length <1) {

      function generateRandomBase64(length) {
        const buffer = crypto.randomBytes(length);
        let base64 = buffer.toString('base64');
        base64 = base64.replace(/\//g, '8'); // Replace '/' with '_'
        base64 = base64.replace(/\+/g, '4'); // Replace '+' with '-'
        base64 = base64.replace(/\=/g, 't'); // Replace '+' with '-'

        return base64;
      }
      

      // Usage example
      const randomBase64 = generateRandomBase64(20);
      console.log(randomBase64);
      await executeQuery(`INSERT INTO clients (gid, nickname , api ) VALUES ('${gid}','${req.oidc.user.nickname}','${randomBase64}');`);
      res.render("home",{isAuthenticated: req.oidc.isAuthenticated() ,  name:name , credits:credits[0].credits , api:randomBase64});

    }else{
      const api = await executeQuery(
        `SELECT api FROM clients  WHERE gid='${gid}'`
      );
      res.render("home",{isAuthenticated: req.oidc.isAuthenticated() ,  name:name , credits:credits[0].credits , api:api[0].api});

    }
    

  
  }


  const ip = IP.address();;
  console.log(ip);
  const isthere = await executeQuery(`SELECT * FROM ipaddress WHERE ip = '${ip}'`);

  if (isthere.length < 1) {
    await executeQuery(`INSERT INTO ipaddress (ip) VALUES ('${ip}')`);
  }else{
    if (isthere[0].valid <1) {
      res.redirect('/login')
    }
  }

  res.render("home",{isAuthenticated: req.oidc.isAuthenticated()});

});

app.get("/test", (req, res) => {

res.render("test");

  
});



app.get("/visits", async (req, res) => {

  if (req.oidc.isAuthenticated()) {
    const valid = {
      'valid':99
    }
    res.json(valid);
  }
  const ip = IP.address();


  await executeQuery(`UPDATE ipaddress SET valid = valid - 1 WHERE ip = '${ip}'`);
  const valid = await executeQuery(`SELECT * FROM ipaddress WHERE ip = '${ip}'`);

  res.json(valid[0]);
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

      if (uploadedFile.originalname.endsWith(".json")) {
        
    
     
        con.query(`UPDATE clients SET models = '${uploadedFile.originalname}', xsmean = '${xsmean}', xsstd = '${xsstd}', ysmean = '${ysmean}', ysstd = '${ysstd}' WHERE gid = '${gid}' AND nickname = '${req.oidc.user.nickname}';`);
    

    

      }

    
    
    }

    res.redirect('/');
  } catch (error) {

  }
});

app.get("/:name/:parameters", async (req, res) => {


  const api = req.params.name;
  const parameters = req.params.parameters;
  var values = JSON.parse(parameters);


  const credits = await executeQuery(`SELECT credits FROM clients WHERE api='${api}'`);

  if (credits[0].credits > 0 && credits[0].credits !== -1 ) {
    await executeQuery(`UPDATE clients
    SET credits = credits - 1
    WHERE api='${api}';`);




  console.log(values);

  console.log(parameters);
  const result = await executeQuery(`SELECT xsmean, xsstd, ysmean, ysstd, models, nickname FROM clients WHERE api='${api}'`);
  console.log(result[0]);

  const xsmean = result[0].xsmean.split(',').map(parseFloat);
  const xsstd = result[0].xsstd.split(',').map(parseFloat);
  const ysmean = result[0].ysmean.split(',').map(parseFloat);
  const ysstd = result[0].ysstd.split(',').map(parseFloat);

  console.log(xsmean, xsstd, ysmean, ysstd);

  const modelPath = 'file://public/uploads/models/' + result[0].nickname + '/' + result[0].models;
  const model = await tf.loadLayersModel(modelPath);

  const normalizedInput = tf.div(tf.sub(tf.tensor1d(values), xsmean), xsstd);
        
  console.log(normalizedInput.data());
  // Predict the price
  const normalizedPrediction = model.predict(normalizedInput.reshape([1, values.length]));
  const denormalizedPrediction = tf.mul(normalizedPrediction, ysstd).add(ysmean);
  const price = denormalizedPrediction.dataSync()[0];
  res.json(price);
  }
  res.sendStatus(404);
});





app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});


  
app.listen(3333)