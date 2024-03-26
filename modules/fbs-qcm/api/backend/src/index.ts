import express from "express";

const app = express();

app.get("/", (req, res) => {
    return res.send("Wasfafafafhsfrshshsssssssssss-------------------sadsdagasWWW");
});

app.listen(3000, () => console.log("LISTENING"));
