const express = require("express");
const router = express.Router();
const roomsController = require("../controllers/roomsController");
const {authenticate} = require("../middleware/auth");



router.get("/get/:userId",authenticate,roomsController.getRooms);
router.get("/:roomId/messages",authenticate,roomsController.getMessages);
router.post("/:roomId/messages",authenticate,roomsController.sendMessage);
router.post("/create" , authenticate , roomsController.createRoom);
module.exports = router;
