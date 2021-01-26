const express=require('express');
const bcrpyt=require('bcrypt');
const User=require('../schemas/user');
const Plan=require('../schemas/plan');
const Cheer=require('../schemas/cheer');
const Comment=require('../schemas/comment');

const router=express.Router();

const path=require('path');
const Multer=require('multer');
const {Storage:GCS}=require('@google-cloud/storage') ;
const storage=new GCS();
const {format}=require('util');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, 
    },
  });
   

router.post('/addPic',multer.single('img'),(req,res,next)=>{

    const {id3}=req.body;
    console.log(req.file);
    const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
    const blob = bucket.file(id3+path.extname(req.file.originalname));
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
        next(err);
    });

    blobStream.on("finish", async() => {
        const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);

        const user=await User.findOne({_id:id3});
        user.profileImage=publicUrl;
        user.save();

        res.json({success:true});
    });
    blobStream.end(req.file.buffer);
 
});


router.post('/addPlan',async(req,res)=>{
    try{
        const{title,isLocked,userId}=req.body;
        
        const user=await User.findOne({_id:userId});
        if(!user) res.json({success:false});

        const time=new Date();
        const year=time.getFullYear(),month=time.getMonth(),day=time.getDate();

        const plan=await Plan.create({
            userId:userId,
            title:title,
            isLocked:isLocked,
            createdAt:new Date(year,month,day+1)
        });

        res.json({sucess:true});

    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/updatePosition',async(req,res,next)=>{
    const {id,latitude,longtitude}=req.body;
    try{
        const user=await User.findOne({_id:id});
        user.latitude=latitude;
        user.longtitude=longtitude;
        user.save();
        res.json({success:true});
    }
    catch(err){
        next(err);
    }
});

router.get('/comment',async(req,res)=>{
    const comments=await Comment.find();
    res.render('comment.ejs',{comments});
});


router.get('/plan',async(req,res)=>{
    const plans=await Plan.find();
    res.render('plan.ejs',{plans});
});

router.get('/',async(req,res)=>{

    const users=await User.find();
    res.render('user.ejs',{users});
});

router.get('/cheer',async(req,res)=>{
    const cheers=await Cheer.find();
    res.render('cheer.ejs',{cheers});
});

router.post('/updatePosition',async(req,res)=>{
   const {latitude,longtitude,userId}=req.body;
   
   const user=await User.findOne({_id:userId});
   user.latitude=latitude;
   user.longtitude=longtitude;
   user.save();
   res.json({success:true});
});


router.post('/addUser',async(req,res)=>{
    const {email,password,displayName}=req.body;
    try{
        const user=await User.findOne({email:email});
        if(user){
            return res.json({success:false,message:'user already exist'});
        }
        else{
            const hash_password=await bcrpyt.hash(password,12);
            
            await User.create({
                email:email,
                displayName:displayName,
                password:hash_password
            });
            return res.json({success:true,message:'join success'});
        }
    }
    catch(err){
        console.log(err);
        return next(err);
    }   
});


router.post('/follow',async(req,res,next)=>{
    const {follow,id1,id2}=req.body;
    console.log(follow);
    try{
        if(follow){
                
            const tmp=await User.findOne({_id:id2});
            if(!tmp) res.json({success:false,message:'user not found'});
            

            const me=await User.findOne({_id:id1});
            if(!me.following_people.includes(id2)){
                me.following_people.push(id2);
            }
            me.save();
    
            const you=await User.findOne({_id:id2});
            if(!you.followed_people.includes(id1)){
                you.followed_people.push(id1);
            }
            you.save();
    
            res.json({success:true});
        }
        else{
        
            const tmp=await User.findOne({_id:id2});
            if(!tmp) res.json({success:false,message:'user not found'});
    
            const me=await User.findOne({_id:id1});
            const yourIdx=me.following_people.indexOf(id2);
            if(yourIdx!=-1) me.following_people.splice(yourIdx,1); 
            me.save();
    
            const you=await User.findOne({_id:id2});
            const myIdx=you.followed_people.indexOf(id1);
            if(myIdx!=-1) you.followed_people.splice(myIdx,1); 
            you.save();
            
            res.json({success:true});           
        }
    }
    catch(err){
        console.error(err);
        next(err);
    }
});


    router.post('/kill',async(req,res)=>{
        const {id}=req.body;
        await Plan.deleteOne({_id:id});
        return res.json({success:true});
    });



module.exports=router;

