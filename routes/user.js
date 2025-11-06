const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");
const {OAuth2Client} = require('google-auth-library')
const secret = config.get("JWT_SECRET")
const auth = require('../auth/auth');
const User = require("../models/User.js");
const Card = require("../models/Card.js")
const { Console } = require("console");


// register

router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    
    let user = await User.findOne({ email });
    console.log("USER", user)
    if(user) {
      //console.log("user exists")
      return res.status(400).send('User already exists');
    }

    user = new User({
      name,
      email,
      password: hash
    });
    console.log("user created", user)
    await user.save();
    
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      config.get("JWT_SECRET"),
      { expiresIn: "2 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    )
    }catch(err) {
      console.log(err)
    }
})


// login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // if(!email || !password) {
  //   return res.status(400).send('Please fill out form.');
  // }
  console.log("LOGIN")
	
	try {
    let user = await User.findOne({ email });
    console.log(user)
		if(!user) {
			return res.status(400).send('No user with that name');
    }
		const isMatch = await bcrypt.compare(password, user.password);
     
    if (!isMatch) {
      
			console.log('no password match');
			return res.status(400).send('Invalid Credentials');
		}
   
		const payload = {
			user: {
				id: user.id,
			},
		};

    const id = user.id
    
		jwt.sign(
			payload,
			config.get('JWT_SECRET'),
			{ expiresIn: 360000 },
			(err, token) => {
        
				if (err) throw err;
        console.log("token issued", token)
        res.json({ token, id});
				
			}
		);
	} catch (err) {
		console.error(err.message, "status", 400);
	}

 });

// Logout

router.post('/logout', async (req, res) => {
	req.user = ""
	req.header('x-auth-token') = null
	res.json('User logged out')
  return res.send('Sorry to see you go... come back sometime.');

  
})

// Delete User
router.post("/remove", auth, async (req, res) => {
  const token = req.body.token
      const user = await User.deleteOne({_id: req.user.id})
      console.log("Delete User", user)

  return res.json({message: 'Sorry to see you go... come back sometime.'});
})


//add thought 
router.post("/entries",  auth, async(req, res)=> {
  try {
    
    const {thought, token} = req.body
    
    let card = new Card({
      text: thought,
      user: req.user.id,
    })
    console.log(card)
    await card.save()
    
    const entries = await Card.find({ user: req.user.id}) 
    res.status(200).json(entries)
    
  } catch(err) {
    console.log(err.response) 
  }

    
})

// get thoughts
router.post("/entries/user", auth,  async (req, res) => {
  // user _id
  console.log("get thoughts", req.user.id)
  const entries = await Card.find({ user: req.user.id}) 

  try {
    return res.send(entries);
  }catch (error) {
    res.status(500).json(error);
  }
})



// delete thought
router.post("/delete", auth, async (req, res) => {
    console.log("delete thought")
    const id = req.body.id
    console.log(id)
    const card = await Card.deleteOne({_id: id})
    res.json({"message": "Card deleted"})
})


// login with google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'postmessage',)
console.log(client)

router.post('/google-token', async (req, res) => {
  const { tokens } = await client.getToken(req.body.tokenResponse)
  console.log("GOOGLE TOkens", tokens)
  res.json(tokens)
})

router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
    const { email_verified, name, email } = response.payload;
    if(email_verified){
      User.findOne({ email }).exec((err, user) => {
        if (user) { 
          const token = jwt.sign({ user:{ id: user.id }}, process.env.JWT_SECRET, { expiresIn: '7d' });
          const { _id, email, name} = user;
          return res.json({
            token,
            user: { _id, email, name }
          });
        } else {
          console.log("NO USER")
          let password = email + Date.now();
          user = new User({ name, email, password });
          user.save((err, data) => {
            if (err) {
                console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                return res.status(400).json({
                    error: 'User signup failed with google'
                });
            }
            const token = jwt.sign({ user:{ id: data.id }}, process.env.JWT_SECRET, { expiresIn: '7d' });
            const { _id, email, name } = data;
            return res.json({
                token,
                user: { _id, email, name }
              });
            });
          }
      });
        } else {
          return res.status(400).json({
            error: 'Google login failed. Try again'
          });
        }
  }) 
})

module.exports = router
