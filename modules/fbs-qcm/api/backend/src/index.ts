import express from "express";

const app = express();

app.get("/", (req, res) => {
    return res.send("Wassassssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssfafafafhsfrshshsssssssssss-------------------sadsdagasWWW");
});
app.get("/test", (req, res) => {
    return res.send("this is test");
});

app.listen(3000, () => console.log("LISTENING on port 3000"));
