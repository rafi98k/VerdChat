const express = require("express");
const router = express.Router();
const roomsController = require("../controllers/roomsController");
const {authenticate} = require("../middleware/auth");


//load rooms for a user
router.get("/get/:userId",authenticate,roomsController.getRooms);
//search for a room
router.get('/search',roomsController.searchRooms);
//create a room
router.post("/create" , authenticate , roomsController.createRoom);
//get messages for a given room
router.get("/:roomId/messages",authenticate,roomsController.getMessages);
//send a message in a given room
router.post("/:roomId/messages",authenticate,roomsController.sendMessage);



module.exports = router;
