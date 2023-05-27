const express = require("express")
const app = express()
var con = require("./database.js");

app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.static("public"));





app.get("/", (req,res) => {



    

res.render("Home" )
})
    


app.listen(3333)