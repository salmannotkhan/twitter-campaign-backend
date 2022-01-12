import axios from "axios";

const wait = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export const getUsername = (users) => {
    const LINK_REGEX = /(?<=twitter.com\/).*(?=\?)/;
    const ALT_REGEX = /(?<=twitter.com\/).*/;
    const STATUS_REGEX = /\/status.*/;
    const USERNAME_REGEX = /^[A-Za-z0-9_]{1,15}$/;

    return users.map((user) => {
        var username;
        if (user.startsWith("@")) {
            username = user;
        } else if (LINK_REGEX.test(user)) {
            username = LINK_REGEX.exec(user)[0];
        } else if (ALT_REGEX.test(user)) {
            username = ALT_REGEX.exec(user)[0];
        }
        if (!username) {
            return "";
        }
        username = username.replace("@", "");
        username = username.replace(STATUS_REGEX, "");
        return USERNAME_REGEX.test(username) ? username : "";
    });
};

export const getFollowers = async (usernames) => {
    var usersData = [];
    const headers = {
        Authorization: `Bearer ${process.env.TOKEN}`,
    };
    const url = "https://api.twitter.com/2/users/by";
    for (let index = 0; index < usernames.length; index += 100) {
        const params = {
            usernames: usernames.slice(index, index + 100).join(),
            "user.fields": "public_metrics",
        };
        const response = await axios.get(url, {
            headers,
            params,
        });
        usersData = usersData.concat(response.data.data);
        await wait(1000);
    }
    return usersData;
};
