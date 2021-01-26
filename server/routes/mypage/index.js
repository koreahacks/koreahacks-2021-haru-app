const express=require('express');
const {verify}=require('../middlewares');
const User=require('../../schemas/user');
const Plan=require('../../schemas/plan');
const Cheer=require('../../schemas/cheer');
const Schedule=require('../../schemas/schedule');
const scheduling=require('node-schedule');
const router=express.Router();
const firebaseAdmin=require('../../firebase');
const Comment=require('../../schemas/comment');


const path=require('path');
const Multer=require('multer');
const {Storage:GCS}=require('@google-cloud/storage') ;
const storage=new GCS();
const {format}=require('util');
const { translateAliases } = require('../../schemas/user');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, 
    },
  });

router.get('/getComment',verify,async(req,res,next)=>{
    try{
        const comments=await Comment.find();
        res.json({success:true,comments:comments});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});


//후기등록
router.post('/registerComment',verify,multer.single('commentImage'),async(req,res)=>{

    const {comment,title}=req.body;
    const _=await User.findOne({_id:req.user._id});
    console.log(comment);
    console.log(req.file);
    if(!req.file){
        await Comment.create({
            displayName:_.displayName,
            profileImage:_.profileImage,
            comment:comment,
            title:title
        });
        return res.json({success:true});
    }

    const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
    const blob = bucket.file('comment'+req.user._id+path.extname(req.file.originalname));
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
        next(err);
    });

    blobStream.on("finish", async() => {
        const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);

        await Comment.create({
            displayName:_.displayName,
            profileImage:_.profileImage,
            comment:comment,
            title:title,
            commentImage:publicUrl
        });
        res.json({success:true});
    });
    blobStream.end(req.file.buffer);
});
   
//사진 수정
router.post('/updatePic',verify,multer.single('profileImage'),(req,res)=>{

    const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
    const blob = bucket.file(req.user._id+path.extname(req.file.originalname));
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
        next(err);
    });

    blobStream.on("finish", async() => {
        const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);

        const user=await User.findOne({_id:req.user._id});
        user.profileImage=publicUrl;
        user.save();

        res.json({success:true});
    });
    blobStream.end(req.file.buffer);
 
});














module.exports=router;