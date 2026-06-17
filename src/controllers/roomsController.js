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
    
    try {
        const message = await prisma.message.create({
            data: {
                userId: sender,
                roomId: roomId,
                content: content,
            },
            include: {
                user: { select: { username: true } },
            },
        });
    } catch (err) {
        console.log(err);
        return;
    }
    res.status(201).json(message);
};

const createRoom = async(req,res)=>{
    const userId = req.user.id;
    const roomName = req.body.roomName ;
}


module.exports = { getRooms,createRoom, getMessages, sendMessage };
