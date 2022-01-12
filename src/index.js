import express from "express";
import formidable from "formidable";
import xlsx from "xlsx";
import "dotenv/config";
import { getUsername, getFollowers } from "./helpers/twitter.js";

const PORT = 3000;
const app = express();

app.get("/", (req, res) => {
    return res.status(200).send({ hello: "world" });
});

app.get("/process", async (req, res, next) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        const xlsxFile = files[Object.keys(files)[0]];
        const wb = xlsx.readFile(xlsxFile.path);
        const worksheetName = wb.SheetNames[0];
        var jsonData = xlsx.utils.sheet_to_json(wb.Sheets[worksheetName]);
        const twitterLinks = jsonData.map((data) => data.twitter);
        const usernames = getUsername(twitterLinks);
        jsonData = jsonData.filter((_row, idx) => {
            return usernames[idx];
        });
        const followers = await getFollowers(
            usernames.filter((username) => username)
        );
        var idx = 0;
        jsonData = jsonData
            .filter((row) => {
                const deleteRow = row.twitter
                    .toLowerCase()
                    .includes(followers[idx].username.toLowerCase());

                if (deleteRow) idx++;
                return deleteRow;
            })
            .map((row, idx) => {
                const { username, name, id } = followers[idx];
                return {
                    ...row,
                    username,
                    name,
                    id,
                    ...followers[idx].public_metrics,
                };
            });
        const newFile = xlsx.utils.json_to_sheet(jsonData);
        const newWb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWb, newFile);
        const processedFile = xlsx.write(newWb, {
            type: "buffer",
            bookType: "xlsx",
        });
        return res.status(200).send(processedFile);
    });
});
app.get("/:name", (req, res) => {
    return res.send(`this is test path ${req.params.name}`);
});

app.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}`);
});
