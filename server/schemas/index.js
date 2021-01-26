const mongoose=require('mongoose');

module.exports=()=>{
    const connect=()=>{
        const {MONGO_ID,MONGO_PASSWORD}=process.env;
        const MONGO_URI=`mongodb+srv://${MONGO_ID}:${MONGO_PASSWORD}@cluster0.bzixa.mongodb.net/<dbname>?retryWrites=true&w=majority`;     
        mongoose.connect(MONGO_URI,{
            dbName:'haru',
            useNewUrlParser:true,
            useUnifiedTopology:true
        },(err)=>{
            if(err) console.log('mongodb connection error',err);
            else console.log('mongodb connection success');
        });
    };

    connect();
    mongoose.connection.on('error',err=>{
        console.log('mongodb connection error',err);
    });

    mongoose.connection.on('disconnected',()=>{
        console.log('mongodb disconnected');
    });
}