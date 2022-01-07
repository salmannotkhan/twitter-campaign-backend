import express from "express";
import "dotenv/config";

const PORT = 3000;
const app = express();

app.get("/", async (req, res) => {
    return res.send({ message: "Twitter campaign" });
});

app.get("/:name", (req, res) => {
    return res.send(`this is test path ${req.params.name}`);
});

app.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}`);
});
