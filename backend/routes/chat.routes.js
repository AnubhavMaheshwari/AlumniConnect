const express = require("express");
const { protect } = require("../middleware/auth");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  getBatchGroups,
} = require("../controllers/chat.controller");

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.get("/batches", protect, getBatchGroups);
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.put("/groupremove", protect, removeFromGroup);
router.put("/groupadd", protect, addToGroup);

module.exports = router;
