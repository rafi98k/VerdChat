const prisma = require("../config/prisma");

const getRooms = async (req, res) => {
    userId = req.params.userId;
    const memeberships = await prisma.RoomMember.findMany({
        where: { userId: userId },

        select: {
            roomId: true,
            isAdmin: true,
            room: {
                select: {
                    id: true,
                    name: true,
                    messages :{
                        orderBy:{createdAt:"desc"},
                        take :1,
                        select:{
                            content:true,
                            user :{select:{username:true}},
                            },
                        },
                    },
                },
            },
        });
            //Get the latest message of each room and add it to the room object
        //for room preview message
    const rooms = memeberships.map(m=>({
        id : m.room.id,
        name : m.room.name,
        isAdmin: m.isAdmin,
        latestMessage : m.room.messages[0] || null,
    })
    );

    return res.json({ rooms });
};

const getMessages = async (req, res) => {
    const roomId = Number(req.params.roomId);
    const messages = await prisma.message.findMany({
        where: { roomId: roomId },
        orderBy: { createdAt: "asc" },
        include: {
            user: {
                select: {
                    username: true,
                },
            },
        },
    });

    return res.json({ messages });
};
const sendMessage = async (req, res) => {
    const roomId = Number(req.params.roomId);
    const sender = req.user.id;
    const content = req.body.content;
    let message;
    try {
         message = await prisma.message.create({
            data: {
                userId: sender,
                roomId: roomId,
                content: content,
            },
            include: {
                user: { select: { username: true } },//we include username to render it in the message info
            },
        });
    } catch (err) {
        console.log(err);
        return;
    }
    res.status(201).json(message);
};

const createRoom = async(req,res)=>{
    //We retrieve the user from the user object in the request,(created by our authenticate middleware
    //which decordes the JWT)
    const userId = req.user.id;
    //The room name is in the request's body
    const roomName = req.body.roomName ;
    //We create the room instance
    const room = await prisma.room.create({
        data:{
            name : roomName,
        }
    });
    //We then use its ID along with the user's to grant membership, as admin because 
    //the user created the room .
    const RoomMember = await prisma.RoomMember.create({
        data:{
            userId:userId,
            roomId: room.id,
            isAdmin:true,
        },
    });
     res.status(201).json(room);
}
//Search for a room
const findRoom = async(req,res)=>{
    const roomId = Number(req.params.roomId);
    const room = await prisma.room.findUnique({
        where :{id:roomId},
        select:{
            id:true,
            name:true,
        }
    });
    let r ={};
    r.roomId = room.id;
    r.room = room;
    return res.json(r);
}

module.exports = { getRooms,createRoom,findRoom ,getMessages, sendMessage };
