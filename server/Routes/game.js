const botToken = process.env.TELEGRAM_BOT_TOKEN;
const express = require('express');
const axios = require('axios');
const { Users, Games, Notifications } = require('../db/schema.js');

const game = express.Router();

game.get('/:name', (req, res) => {
  console.log('name from parameters', req.params);
  const { name } = req.params;
  axios
    .get(`https://steamcommunity.com/actions/SearchApps/${name}`)
    .then(({ data }) => {
      if (!data.length) {
        res.sendStatus(404);
      }
      if (data.length > 1) {
        // return data.map((game) => {
        //   return axios.get(`https://store.steampowered.com/api/appdetails?appids=${gameId}`)
        // })
      }
      const gameId = data[0].appid;
      // console.log('gameobj from steam\n', data, '\n\ngameid returned from api', gameId);
      axios
        .get(`https://store.steampowered.com/api/appdetails?appids=${gameId}`)
        .then(({ data }) => {
          const game = data[gameId].data;
          console.log('data returned from store api', game);
        })
        .catch((err) => {
          console.error('error getting data by id\n', err);
        });
    })
    .catch((err) => {
      console.error('error requesting app id by name\n', err);
      res.sendStatus(500);
    });
});

// this endpoint will get games by a genre and take return the first 10.
game.post('/genre', (req, res) => {
  const config = {
    method: 'get',
    url: `http://steamspy.com/api.php?request=genre&genre=${req.body.genre}&page=1`,
    headers: {},
  };

  axios(config)
    .then((response) => {
      const top10Games = [];
      const keys = Object.keys(response.data);
      for (let i = 0; i < 10; i += 1) {
        top10Games.push(response.data[keys[i]]);
      }
      res.status(200).send(JSON.stringify(top10Games));
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send('Error in the request to the steam api');
    });
});
// url to notify webpage that a user has started a chat with the bot: https://${siteUrl}/game/newUser
game.post('/newUser', (req, res) => {
  const { message } = req.body;
  if (message.text.split(' ')[0] === '/start') {
    // This is the user token to associate the user in the database with the user on telegram
    const userToken = message.text.split(' ')[1];
    const chatId = message.chat.id;
    axios
      .post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: 'You are now subscribed to notifications from Game&Watch',
      })
      .then()
      .then(() => {
        return Users.findOneAndUpdate({ id: userToken }, { chatId });
      })
      .then((result) => {
        console.log(result);
        res.sendStatus(200);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(400);
      });
  } else {
    res.sendStatus(200);
  }
});

// url to have user click: https://telegram.me/GameAndWatchBot?start=${userId}

// Url for getting news about a game by its id:  http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${game.id}&count=5&format=json
// Endpoint for finding out if any games have been updated
game.get('/updates', (req, res) => {
  let allPatchNotes;
  let notifications;
  Notifications.find({})
    .then((notifs) => {
      console.log('notifs: ', notifs);
      notifications = notifs;
      // Might be able to use just promise.all without promise.resolve
      return Promise.resolve(
        Promise.all(
          notifs.map((notif) => axios.post(
            `http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${notif.gameId}&count=10&format=json`,
          )),
        ),
      );
    })
    .then((allNews) => {
      console.log('allNews: ', allNews);
      allPatchNotes = allNews.map((gameNews) => {
        gameNews.appNews.newsItems = gameNews.appNews.newsItems.filter(
          (news) => news.tags && news.tags.includes('patchnotes'),
        );
        return gameNews;
      });
      return Promise.resolve(
        Promise.all(
          allPatchNotes.map((patchNotes) => Games.findOne({ id: patchNotes.appNews.appid })),
        ),
      );
    })
    .then((games) => {
      console.log('games: ', games);
      games.forEach((game, i) => {
        if (
          game.most_recent_update.title
          !== allPatchNotes[i].appNews.newsItems[0].title
        ) {
          game.most_recent_update = allPatchNotes[i].appNews.newsItems[0].title;
          Games.findOneAndUpdate(game, game);
          notifications.forEach((notification) => Users.findOne({ id: notification.userId })
            .then((user) => {
              console.log('user: ', user);
              return Promise.resolve(Promise.all(notifications.map((noti) => {
                if (noti.gameId === game.id && noti.userId === user.id) {
                  const text = `**New Update**\n${game.name}\n${game.most_recent_update.title}\n${game.url}`;
                  return axios.post(
                    `https://api.telegram.org/bot${botToken}/sendMessage`,
                    {
                      chat_id: user.chatId,
                      text,
                    },
                  );
                }
                return null;
              }).filter((a) => a !== null)));
            })
            .then(() => {
              res.sendStatus(200);
            }));
        }
      });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

module.exports = game;
