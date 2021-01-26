const mongoose=require('mongoose');

const {Schema}=mongoose;
const {Types:{ObjectId}}=Schema;

const scheduleSchema=new Schema({
    userId:{
        type:ObjectId,
        required:true,
        ref:'User'
    },
    alarmTime:{
        type:String
    },
    alarmDays:{
        type:[]
    },
    token:{
        type:String
    },
    notification:{
        
    }
});

module.exports=mongoose.model('Schedule',scheduleSchema);