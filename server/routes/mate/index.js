const express=require('express');
const {verify}=require('../middlewares');
const User=require('../../schemas/user');
const Plan=require('../../schemas/plan');
const Cheer=require('../../schemas/cheer');
const router=express.Router();




//받은 응원 가져오기**
router.get('/getCheer',verify,async(req,res,next)=>{
    try{
        var date = new Date(), year = date.getFullYear(), month = date.getMonth(),day=date.getDate();
        const cheers=await Cheer.find({
            toId:req.user._id,
            createdAt:new Date(year,month,day+1)
        });

        var cheer_mate=[];
        for(var _ in cheers){
            var ob={};
            const u=cheers[_].fromId;
            const uu=await User.findOne({_id:u});
            ob.cheer=cheers[_];
            ob.displayName=u.displayName;
            ob.profileImage=u.profileImage;
            cheer_mate.push(ob);
        }

        res.json({success:true,cheer_mate:cheer_mate});

    }
    catch(err){
        console.error(err);
        next(err);
    }
});





/*
router.get('/get',verify,async(req,res,next)=>{
    try{
        
        const tmp1=await User.findOne({_id:req.user._id})
        .select('following_people');
    
        var mate_todo=[];

        for(var _ in tmp1.following_people){
            var el={};
            const tmp2=await User.findOne({_id:tmp1.following_people[_]})
            .select('_id displayName profileImage');
            el.mate=tmp2;
            const tmp3=await Plan.find({userId:tmp2._id});
            el.todo=tmp3;
            mate_todo.push(el);
        }

        res.json({success:true,mate_todo:mate_todo});

    }
    catch(err){
        console.error(err);
        next(err);
    }
});
*/

//응원 보내기**
router.post('/registerCheer',verify,async(req,res,next)=>{

    try{
        var date = new Date(), year = date.getFullYear(), month = date.getMonth(),day=date.getDate();

        const {userId,message}=req.body;
        await Cheer.create({
            fromId:req.user._id,
            toId:userId,message:message,
            createdAt:new Date(year,month,day+1)
        });
        res.json({success:true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});


//follow한 사람들의 plan가져오기
router.post('/getMatePlan',verify,async(req,res,next)=>{

    try{
        var date = new Date(), year = date.getFullYear(), month = date.getMonth(),day=date.getDate();
        const {userId}=req.body;
        const plans=await Plan.find({
            userId:userId,
            createdAt:new Date(year,month,day+1)
        });
        res.json({success:true,mate:plans});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});


//follow한 mate가져오기**
router.get('/getMate',verify,async(req,res,next)=>{
    try{
       
        const tmp1=await User.findOne({_id:req.user._id})
        .select('following_people');
    
        var mate=[];

        for(var _ in tmp1.following_people){
            const tmp2=await User.findOne({_id:tmp1.following_people[_]})
            .select('_id displayName profileImage');
            mate.push(tmp2);
        }

        res.json({success:true,mate:mate});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

//follow하기
router.post('/follow',verify,async (req,res,next)=>{

    try{
        const myId=req.user._id;
        const{userId}=req.body;
        const yourId=userId;
        
        const tmp=await User.findOne({_id:yourId});
        if(!tmp) res.json({success:false,message:'user not found'});
        

        const me=await User.findOne({_id:myId});
        if(!me.following_people.includes(yourId)){
            me.following_people.push(yourId);
        }
        me.save();

        const you=await User.findOne({_id:yourId});
        if(!you.followed_people.includes(myId)){
            you.followed_people.push(myId);
        }
        you.save();

        res.json({success:true});
        
        
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

//unfollow하기
router.post('/unfollow',verify,async (req,res,next)=>{

    try{
        const myId=req.user._id;
        const{userId}=req.body;
        const yourId=userId;

        const tmp=await User.findOne({_id:yourId});
        if(!tmp) res.json({success:false,message:'user not found'});

        const me=await User.findOne({_id:myId});
        const yourIdx=me.following_people.indexOf(yourId);
        if(yourIdx!=-1) me.following_people.splice(yourIdx,1); 
        me.save();

        const you=await User.findOne({_id:yourId});
        const myIdx=you.followed_people.indexOf(myId);
        if(myIdx!=-1) you.followed_people.splice(myIdx,1); 
        you.save();
        
        res.json({success:true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});






module.exports=router;