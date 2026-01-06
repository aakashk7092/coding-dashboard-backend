import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    leetcode: "https://leetcode.com/u/aakashkumar2005/",
    github: "https://github.com/aakashk7092",
    hackerrank: "https://www.hackerrank.com/profile/aakashk7092",
    unstop: "https://unstop.com/u/aakaskum19946",
    linkedin: "https://www.linkedin.com/in/aakash-kumar-aa3093315/",
  });
});

export default router;
