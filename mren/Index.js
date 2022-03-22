const mongo = require('mongoose');
const express = require("express");
const bodyParser = require('body-parser');
var cors = require('cors');
const multer = require('multer');
var cookieParser = require('cookie-parser')
const path= require('path');
const jwt = require('jsonwebtoken');
const { type } = require('os');
const { default: Stripe } = require('stripe');
const app = express();


app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(cookieParser())
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
let sisir = 'sisir_khan';


const uri = "mongodb+srv://sakib24:23568923@cluster0.cpnnn.mongodb.net/sisir?retryWrites=true&w=majority";
 
mongo.connect(uri, {
  useNewUrlParser: true,
   useUnifiedTopology: true
}).then(()=>{
  console.log('connect successful');
}).catch((err)=>console.log('connect hoy na'));
const todos = mongo.Schema({
  name:{type:String}
})
const schmea = mongo.Schema({

  fname:{
      type:String,
  },
  lname:{
    type:String,
},
  email :{
      type: String,
  },
  password: {
      type: String,
  },
  price :{
    type: String 
},

});

const reg = mongo.Schema({

  name:{
      type:String,
  },
  email :{
      type: String,
  },
  password: {
      type: String,
  },
  file:{
   type:String,
  }

});
const catagori = mongo.Schema({
  user:{
    type: mongo.Types.ObjectId,
    ref:"Regster"
  },
  catagori: {
    type:String,
  }
});

const products = mongo.Schema({

  name:{
      type:String,
  },
  desc :{
      type: String,
  },
  price: {
      type: String,
  },
  file:{
   type:String,
  },
  user:{
    type: mongo.Types.ObjectId,
    ref:"Regster"
  },

});
const Todos = new mongo.model("todo",todos);
const todo = new mongo.model("User",schmea);
const products_add = new mongo.model("products",products);
const okreg = new mongo.model("Regster",reg);
const catago = new mongo.model("catagori",catagori);

const chack = async (req, res, next) =>{
  try {
    const cokkieName = req.cookies;
 

    const co = cokkieName.sisir;
    const dew =await jwt.verify(co,sisir);
    req.user = dew.id;
    next();
  } catch (error) {
    next('please login ')
  }
  
}


app.post('/todos', async (req, res)=>{
  const name = req.body.name
  if(name.length>3){
    const todos = new Todos({name})
    const data= await todos.save({})
  if(data){
    res.send({mes:"data insart success"})
    console.log("data insart success")
  }
  }
  else{
    res.send({mes:"minimam 4 "})
    console.log("minimam 4")
  }
})
app.get('/todo_data_get', async (req, res)=>{

const data = await Todos.find({})

res.send(data)

})

app.delete('/todo_data_delete/:id', async (req, res)=>{
  const id = req.params.id;
  const ok = await Todos.deleteOne({_id:id});
  if(ok){
    console.log("data delete")
  }
  
  })

app.get('/todo_edite/:id', async (req, res)=>{
 
  const id = req.params.id;

const data = await Todos.findOne({_id: id})


if(data){
  res.send({
    name:data.name,
    id:data._id
  });
}
//const update = await Todos.updateOne({_id:id},{$set: {name:name}});
//if(update){
 // res.send("update ok vai")
//}
})



app.post('/edite_todo/:id', async (req, res)=>{
 
  const id = req.params.id;
  const name= req.body.name
  
  const update = await Todos.updateOne({_id:id},{$set: {name}});

if(update){
  res.send({
    name:'hello edite ok',
  });
  console.log('hello edite ok')
}

//const update = await Todos.updateOne({_id:id},{$set: {name:name}});
//if(update){
 // res.send("update ok vai")
//}
})













app.get('/lodeuser',chack, async (req, res)=>{
 
     const id =req.user;
    const paici = await okreg.findOne({_id:id})


 res.status(200).send(paici)
  
  })

app.get('/logout', (req, res)=>{

  res.clearCookie("sisir").send("logout hoyce");
 })


app.get('/getdata', chack, async (req, res)=>{
 

 const data = await okreg.find({});
 res.send(data)
 console.log('data pai ci ostad')
 //console.log(req.headers);

})



const uplodefolder = "./uploads";
const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    cb(null, uplodefolder)
  },
  filename: (req, file, cb) =>{
    const fileExt = path.extname(file.originalname);
    const filename = file.originalname
    .replace(fileExt, "")
    .toLowerCase()
    .split(" ")
    .join("-") +"-"+ Date.now();
    cb(null, filename + fileExt);
  },
})


var upload = multer({
  storage:storage,
  limits : {
    fileSize : 1000000,
  },
  fileFilter: (req, file, cb) =>{
   if(file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" )
      {
        cb(null, true);
      }else{
        cb(new error("only allow png, jepg, ipg"));
      }

  }
});




app.post("/uplode", upload.single("sisir"), (req, res) => {
  console.log(req.file);

});






app.post('/regster', upload.single("sisir"), async (req, res)=>{
  const {name, email, password} = req.body;
 const file = req.file.path;

const exit = await okreg.findOne({email});
if(exit){
res.status(400).send('email all reday exit')
}
const regste = new okreg({name, email, password,file})

const reg = await regste.save({});
if(reg){
res.status(200).send('data insarte suesecc');
}else{
res.status(400).send('data not inster');

}


})

app.get("/singledata/:id",chack, async (req, res)=>{

  const id = req.params.id;
  

  const data = await okreg.findOne({_id: id})


if(data){
  res.send({
    name:data.name,
    email:data.email,
    password: data.password
  });
}
})

app.post('/update/:id',chack, async (req, res)=>{
  const {name, email, password} = req.body;

  const id = req.params.id;

const update = await okreg.updateOne({_id:id},{$set: {name:name,email:email, password:password}});
if(update){
  res.send("update ok vai")
}
})

app.delete("/delete/:id", chack, async (req, res)=>{
  const id = req.params.id;
  const ok = await okreg.deleteOne({_id:id});
  if(ok){
    console.log("data delete")
  }
})
app.post('/login', async (req, res)=>{
const {email, password} = req.body;



const result = await okreg.findOne({email});
if(result){
  if(result.password === password){
const token = jwt.sign({id:result._id, name: result.name}, sisir);

res.cookie('sisir',token, { maxAge:8900000, httpOnly: true }).send(result)


  }else{
    res.status(400).send('username or password not match !')

  }
}else{
  res.status(400).send('username or password not match !')
}




})

app.post("/catagori",chack, async (req, res)=>{

  const {name} = req.body;
  const id = req.user;
  console.log(id)
 const ck= await catago.findOne({catagori:name})
 if(ck){
   console.log("catagori all reday exit")
   res.status(404).send("catagori all reday exit")
 }
else{
 const okchack = new catago({user:id,catagori:name})
 const cata= await okchack.save({})
 if(cata){
   console.log(" catagori save ")
 }
}

})

app.get('/catagori_find', chack, async (req, res)=>{
 const chackdata = await catago.find({})
 if(chackdata){
   res.send(chackdata)
 }
})

app.post('/productss',chack, upload.single("sisir"), async  (req, res)=>{
   const {pname,pdesc, price} = req.body;
  const file = req.file.path;
const {user} = req.user;
// products_add 
const add_prod = new products_add({name:pname, desc:pdesc, price, file:file, user})
const data_send = await add_prod.save({});
if(data_send){
  res.status(200).send('products insart sussechefull');
  console.log('products insart sussechefull');
}

})

app.get('/pro_single', chack, async (req, res)=>{
   const data = await products_add.find({});
 res.send(data)
 console.log('data pai XXXXXXXX')
})


app.get('/add_to_card_single/:id', chack, async (req, res)=>{
  const {id} = req.params;
   const data = await products_add.findOne({ _id:id });
if(data){
  res.send(data)
  console.log('data pai')
}

})


app.get('/chack', async (req, res)=>{
  const page=req.query.page
  const size=req.query.size
  const total = await products_add.find({})
  res.setHeader("sisir",total.length);
const limit = parseInt(size)
const skip = (page - 1) * size;

const data = await products_add.find({}).limit(limit).skip(skip)
console.log()
res.send(data)
})

app.post("/stripe/charge", async (req, res)=>{

   let { amount, id } = req.body;
   try {
    const payment = await stripe.paymentIntents.create({
      amount: amount,
      currency: "USD",
      description: "Your Company Description",
      payment_method: id,
      confirm: true,
    });
    console.log("stripe-routes.js 19 | payment", payment);
    res.json({
      message: "Payment Successful",
      success: payment,
    });
  } catch (error) {
    console.log("stripe-routes.js 17 | error", error);
    res.json({
      message: "Payment Failed",
      success: false,
    });
  }
})






























































app.post("/submit", async (req, res)=> {
   const {fname, lname, email, password, price} = req.body; 


  const sa = new todo({fname, lname, email, password, price});
   const  data = await sa.save({});
   if(data){
     res.status(202).send('send data ok');
   }else{
     res.status(404).send('data send hoyna ');
   }
})

app.get('/single_data/:id', async (req, res)=>{
const id=req.params.id;

const fast = await todo.findOne({_id:id});
if(fast)
{res.send(fast)}
else{
  res.status(404).send("data ase na !");
}
  

})

app.get('/show', async (req, res)=>{
    const sad = await todo.find({});
try {
  res.send(sad)

} catch (error) {
  res.status(404).send( "data to paina keno re")
}


 


})
app.delete('/deleteser/:id', async (req, res)=>{
  const id = req.params.id;
      const deletes = await todo.findByIdAndRemove(id).exec();
if(deletes){res.status(202).send('data remove sessefull')}
else{res.send('delete hoy na ')}
})

app.post('/login',async (req, res, next)=>{
 // console.log(dat)
  const data = await todo.findOne({email:req.body.email});
  if(data){
    if(data.password === req.body.password){
      res.status(200).json(data);
    console.log(data)
    
    }else{
      res.status(404).send("password paina");
       }
    
  }else{
    res.status(404).json({message:"data paina", 
    status:false
  })
    console.log("data paina********************")
  }
})


app.locals.title = 'My App';

app.get('/test/:id', function (req, res) {
  res.send('hello world  '+ req.params.id+req.baseUrl)
  console.dir(app.locals.title)
// => 'My App'

console.dir(app.locals.email)
})
/*

app.use((req, res, next)=>{
  res.status(404).send(`you re link  invlid`)
})




function usd (req, res, next) {
  req.data = {
    name : 'sisir',
    age : 28,
    email: 'sisir@gmal.com'
  }
  next()
}
app.use(usd)
function hello (req, res, next) {
  console.log('Time:', Date.now())
if(req.params.id == 5)
{
  console.log("ok dun");
  req.data = 40;
}
  next()
}

app.get("/sisir/:id",hello, (req, res) => {
  res.send(req.data)
  res.json("hellollllllllllll")

})

app.get("/khan", (req, res) => {
  
  res.send('this is a khan page'+ req.data)

})
*/



/*
const uplodefolder = "./uploads";
const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    cb(null, uplodefolder)
  },
  filename: (req, file, cb) =>{
    const fileExt = path.extname(file.originalname);
    const filename = file.originalname
    .replace(fileExt, "")
    .toLowerCase()
    .split(" ")
    .join("-") +"-"+ Date.now();
    cb(null, filename + fileExt);
  },
})


var upload = multer({
  storage:storage,
  limits : {
    fileSize : 1000000,
  },
  fileFilter: (req, file, cb) =>{
   if(file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" )
      {
        cb(null, true);
      }else{
        cb(new error("only allow png, jepg, ipg"));
      }

  }
});




app.post("/uplode", upload.single("sisir"), (req, res) => {
  console.log(req.files);
  res.send(true);
});



app.use((err, res, next) =>{
  if(err){
    if(err instanceof multer.MulterError){
      res.status(500).send("ther was werr");
    }else{
      res.status(500).send(err.message);
    }
    
  }else{
    res.send("success");
  }
})









const schmea = mongo.Schema({

  name:{
      type:String,
  },
  email :{
      type: String 
  },
  password: {
      type: String,
  },
  price :{
    type: String 
},
catagori: {
    type: String,
}
});


const todo = new mongo.model("User",schmea);

app.delete('/delete/:id', async (req, res)=>{
  const id = req.params.id;
  await todo.findByIdAndRemove(id).exec();
res.send('data delite hoyce');

})

// data reade react 
app.get('/alldata', async (req, res)=>{
  const docs = await todo.find({}, (err, response)=>{
    if(err){
      res.send(err)
    }else{

      res.send(response);
    }
  });
  console.log(docs);
  res.send( docs)
})





app.post('/sisir', async (req, res)=>{
  const {name, email, password,price ,catagori} = req.body;
 
  const user = new todo({ name, email, password,price ,catagori});
  await user.save().then(()=>{

    res.status(200).json({message :"DATA INSATRE successful", })
    console.log("DATA INSATRE successful");
      
  }) .catch(err => { console.log(err); });
  /*await newtodo.save((err)=>{
      if(err){
          res.status(500).json({
              error : "this a a errar",
          });
      }else{}
  })
  
 res.send("hello sisir");
})

*/



app.listen(5000, ()=>{console.log("server run 5000")})