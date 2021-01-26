const SocketIO=require('socket.io');
const {verify}=require('./routes/middlewares');
const Plan=require('./schemas/plan');
const User=require('./schemas/user');
const {calDist}=require('./routes/middlewares');

module.exports=(server,app)=>{

    
    const io=SocketIO(server,{path:'/socket.io'});
    app.set('io',io);
    const map=io.of('/map');


/*
    map.use((socket,next)=>{
        verify(socket.request,socket.request.res,next);
    });*/

    map.on('connection',socket=>{
        console.log('xxxxxxxxxxxxxx');
        //console.log(socket.request.user);
        //if(socket.request.user){
            //const userId=socket.request.user._id;
            socket.on('position',async(data)=>{

                try{
                    console.log('yyyyyyyyyyyyyy');
                    const userId=data._id;
                    await User.findOneAndUpdate({_id:userId},
                        {longtitude:data.longtitude,latitude:data.latitude});
                    
                    var user=await User.find().select('_id longtitude latitude displayName profileImage');
                    
                    var users=[];
                    for(var _ in user){
                        if(!user[_].latitude||!user[_].longtitude||user[_].id==userId) continue;
                        var t={};
                        t.distance=calDist(user[_].latitude,data.latitude,user[_].longtitude,data.longtitude);
                        t._id=user[_]._id;
                        t.longtitude=user[_].longtitude;
                        t.latitude=user[_].latitude;
                        t.displayName=user[_].displayName;
                        t.profileImage=user[_].profileImage;
                        users.push(t);
                    }
                    

                    users.sort((a,b)=>{
                        return a.distance-b.distance;
                    });

                    

                    var pos_user=[];
                    for(var _ in users){
                        var ob={};
                        const id=users[_]._id;
                        const plan=await Plan.find({userId:id});
                        ob.displayName=users[_].displayName;
                        ob.profileImage=users[_].profileImage;
                        ob.planArray=plan;
                        ob.userId=id;
                        ob.region={latitude:users[_].latitude,longtitude:users[_].longtitude};
                        const tt=await User.findOne({_id:userId});
                        if(tt.following_people.includes(id)) ob.isFollowing=true;
                        else ob.isFollowing=false;
                        pos_user.push(ob);
                    }

                    io.of('map').emit('user',pos_user);
                }
                catch(err){
                    console.error(err);
                }
                
            });
        //}
    });
 
}