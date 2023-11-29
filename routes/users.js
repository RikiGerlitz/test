// 5
const express= require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {UserModel,userValid,loginValid,createToken} = require("../models/userModel")
const router = express.Router();
const {auth,authAdmin} = require("../middlewares/auth")
//  const { config } = require("../config/secret")

router.get("/" , async(req,res)=> {
  let perPage = Math.min(req.query.perPage,20) || 99;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try{
    let data = await UserModel
    .find({})
    .limit(perPage)
    .skip((page - 1)*perPage)
    .sort({[sort]:reverse})
    res.json(data);
  } 
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})
//  בשביל יצירת רשומה נצטרך ךיצור מודל חדש 
router.post("/",async(req,res) => {
  let valdiateBody = userValid(req.body);
  if(valdiateBody.error){
    return res.status(400).json(valdiateBody.error.details)
  }
  try{
    let user = new UserModel(req.body);
    // הצפנה חד כיוונית לסיסמא ככה 
    // שלא תשמר על המסד כמו שהיא ויהיה ניתן בקלות
    // לגנוב אותה
    user.password = await bcrypt.hash(user.password, 10)
    await user.save();
    // כדי להציג לצד לקוח סיסמא אנונימית
    // האקרים יכולים לעשות פעולה שמחזירה אחורה ולבדוק מה הנתונים שנשלחו דרך הצד לקוח
    user.password = "*********";
    res.status(201).json(user)
  }
  catch(err){
    // בודק אם השגיאה זה אימייל שקיים כבר במערכת
    // דורש בקומפס להוסיף אינדקס יוניקי
    if(err.code == 11000){
      return res.status(400).json({msg:"Email already in system try login",code:11000})
    }
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.post("/login", async (req, res) => {
  let validBody = loginValid(req.body);
  if (validBody.error) {
    // .details -> מחזיר בפירוט מה הבעיה צד לקוח
    return res.status(400).json(validBody.error.details);
  }

  try {
    // קודם כל לבדוק אם המייל שנשלח קיים  במסד
    let user = await UserModel.findOne({ email: req.body.email })
    console.log(user.role);
    if (!user) {
      return res.status(401).json({ msg: "Password or email is worng ,code:1" })
    }
    // אם הסיסמא שנשלחה בבאדי מתאימה לסיסמא המוצפנת במסד של אותו משתמש
    let authPassword = await bcrypt.compare(req.body.password, user.password);
    if (!authPassword) {
      return res.status(401).json({ msg: "Password or email is worng ,code:2" });
    }
    // מייצרים טוקן שמכיל את האיידי של המשתמש
    let token = createToken(user._id,user.role);
    res.json({token});
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.get("/usersList", authAdmin , async(req,res) => {
  try{
    let data = await UserModel.find({},{password:0});
    res.json(data)
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }  
})

router.get("/myInfo", async (req, res) => {
  // בדיקה אם המשתמש בכלל שלח טוקן בהידר
  // הסיבה שעובדים מול הידר, שהוא גם מאובטח וגם נותן לשלוח עד 600 תווים
  // וגם עובד בבקשת גט לעומת באדי שלא עובד
  // req.query, req.params, req.body, req.header
  let token = req.header("x-api-key");
  if (!token) {
    return res.status(401).json({ msg: "You need to send token to this endpoint url" })
  }
  try {
    // מנסה לפענח את הטוקן ויכיל את כל המטען/מידע שבתוכו
    let tokenData = jwt.verify(token, "RikiSecret");
    console.log(tokenData);


    // עושה שאילתא של שליפת המידע מהמסד לפי האיי די שפוענח בטוקן
    // {password:0} -> יציג את כל המאפיינים חוץ מהסיסמא ואם זה 1
    // דווקא יציג רק אותו ולא יציג אחרים
    // 
    let user = await UserModel.findOne({ _id: tokenData._id },
       { password: 0 });
    // אומר לא להציג את הסיסמא מתוך המאפיינים
    res.json(user);
  }
  catch (err) {
    return res.status(401).json({ msg: "Token not valid or expired" })
  }

})

router.get("/myEmail",auth,async(req,res) => {
  try{
    let user = await UserModel.findOne({_id:req.tokenData._id},
      {email :1})
      res.json(user);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"err",err})
  }
})

module.exports = router;