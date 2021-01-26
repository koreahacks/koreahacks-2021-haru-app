const mongoose=require('mongoose');

const {Schema}=mongoose;
const {Types:{ObjectId}}=Schema;

const userSchema=new Schema({

    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:false
    },
    displayName:{
        type:String,
        required:true
    },
    profileImage:{
        type:String,
        required:false,
        default:'https://storage.googleapis.com/evenshunshine/default.png'
    },
    following_people:[{
        type:ObjectId,
        ref:'User'
    }],
    followed_people:[{
        type:ObjectId,
        ref:'User'
    }],
    longtitude:{
        type:Number,
        required:false
    },
    latitude:{
        type:Number,
        required:false
    }
});

module.exports=mongoose.model('User',userSchema);