const express=require('express');

const {verify}=require('../middlewares');
const User=require('../../schemas/user');
const Plan=require('../../schemas/plan');

const router=express.Router();

router.get('/getOpen',verify,async(req,res,next)=>{
    try{
        var date = new Date(), year = date.getFullYear(), month = date.getMonth(),day=date.getDate();
        const plans=await Plan.find({
            isLocked:false,
            createdAt:new Date(year,month,day+1)
        });
        res.json({success:true,plans:plans});

    }
    catch(err){
        console.error(err);
        next(err);
    }
});

//좋아요한 플랜들 가져오기**
router.get('/getLike',verify,async(req,res,next)=>{
    try{
        const t=await Plan.find();

        const plans=[];
        t.forEach(_=>{
            if(_.like_people.includes(req.user._id)){
                plans.push(_);
            }
        })

        res.json({success:true,plans:plans});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

//좋아요 하기**
router.post('/registerLike',verify,async(req,res,next)=>{
    try{
        const{planId}=req.body;
        const plan=await Plan.findOne({_id:planId});
        if(!plan.like_people.includes(req.user._id)){
            plan.like_people.push(req.user._id);
        }
        plan.save();

        res.json({success:true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

//좋아요 취소하기**
router.post('/cancelLike',verify,async(req,res,next)=>{
    try{
        const{planId}=req.body;
        const plan=await Plan.findOne({_id:planId});
        if(plan.like_people.includes(req.user._id)){
            const idx=plan.like_people.indexOf(req.user._id);
            plan.like_people.splice(idx,1);
        }
        plan.save();
        res.json({success:true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});


//오늘 이룬 플랜 가져오기**
router.get('/todayFinished',verify,async(req,res,next)=>{
    try{
        var date = new Date(), y = date.getFullYear(), m = date.getMonth(),d=date.getDate();
        var t=new Date(y,m,d+1);

        const plans=await Plan.find({
            userId:req.user._id,
            createdAt:t,
            isFinished:true
        });

        res.json({success:true,plans:plans});

    }
    catch(err){
        console.error(err);
        next(err);
    }
});


// 이번 달 플랜 가져오기**
router.get('/getThisMonth',verify,async(req,res,next)=>{
    try{
        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);

        const plans=await Plan.find({
            userId:req.user._id,
            createdAt:{
                $gte:firstDay,
                $lte:lastDay
            }
        });

        res.json({success:true,plans:plans});

    }
    catch(err){
        console.error(err);
        next(err);
    }
});



// 플랜가져오기**
router.get('/get',verify,async(req,res,next)=>{
    try{
        var date = new Date(), year = date.getFullYear(), month = date.getMonth(),day=date.getDate();
        const plan=await Plan.find({
            userId:req.user._id,
            createdAt:new Date(year,month,day+1)
        });

        res.json({success:true,plans:plan});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});


//플랜 인기순으로 플랜과 사람들 가져오기**
router.get('/LikeSort',verify,async(req,res,next)=>{
    try{
        const plans=await Plan.find({userId:req.user._id});
        plans.sort((a,b)=>{
            return b.like_people.length-a.like_people.length;
        });
        

        var like_plans=[];

        for(var _ in plans){
            var like_plan={};
            like_plan.plan=plans[_];
            
            var like=[];
            for(var __ in plans[_].like_people){
                const id=plans[_].like_people[__];
                const user=await User.find({_id:id});
                like.push(user);
            }
            like_plan.like=like;
            like_plans.push(like_plan);
        }

        res.json({success:true,like_plans:like_plans});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});


// 플랜 등록하기**
router.post('/register',verify,async(req,res,next)=>{
    try{
        const{title}=req.body;
        const userId=req.user._id;

        if(!title) res.json({success:false,message:'title is empty'});

        const time=new Date();
        const year=time.getFullYear(),month=time.getMonth(),day=time.getDate();

        const plan=await Plan.create({
            userId:userId,
            title:title,
            createdAt:new Date(year,month,day+1)
        });

        res.json({sucess:true,plan:plan});

    }
    catch(err){
        console.error(err);
        next(err);
    }
});

//플랜 완료 수정**
router.post('/updateFinish',verify,async(req,res)=>{
    try{
        const{planId,isFinished}=req.body;

        const plan=await Plan.findOne({_id:planId});
        if(!plan) res.json({success:false});

        plan.isFinished=isFinished;
        plan.save();

        res.json({success:true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});


//플랜 제목 수정
router.post('/updateTitle',verify,async(req,res)=>{
    try{
        const{planId,title}=req.body;

        const plan=await Plan.findOne({_id:planId});
        if(!plan) res.json({success:false});
        plan.title=title;
        plan.save();
        res.json({success:true});

    }
    catch(err){
        console.error(err);
        next(err);
    }
});

//플랜 잠금 수정
router.post('/updateLock',verify,async(req,res)=>{
    try{
        const{planId,isLocked}=req.body;

        const plan=await Plan.findOne({_id:planId});
        if(!plan) res.json({success:false});

        plan.isLocked=isLocked;
        plan.save();

        res.json({success:true});

    }
    catch(err){
        console.error(err);
        next(err);
    }

});

//플랜 삭제
router.post('/deletePlan',verify,async(req,res,next)=>{
    try{
        const{planId}=req.body;
        await Plan.deleteOne({_id:planId});
        res.json({success:true});
    }
    catch(err){
        console.error(err);
        next(err);
    }

});



module.exports=router;