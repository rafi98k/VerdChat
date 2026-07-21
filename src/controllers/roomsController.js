const prisma = require("../config/prisma");

const getRooms = async (req, res) => {
    userId = req.params.userId;
    const rooms = await prisma.RoomMember.findMany({
        where: { userId: userId },

        select: {
            roomId: true,
            isAdmin: true,
            room: {
                select: {
                    name: true,
                },
            },
        },
    });

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


module.exports = { getRooms,createRoom, getMessages, sendMessage };
