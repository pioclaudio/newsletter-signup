const express = require('express');
const path = require('path');
const mailchimp = require('@mailchimp/mailchimp_marketing');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const port = process.env.PORT || 3000;
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API,
  server: process.env.MAILCHIMP_SERVER,
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'signup.html'));
});

app.post('/', (req, res) => {
  const listId = process.env.MAILCHIMP_LISTID;
  const subscribingUser = {
    firstName: req.body.fName,
    lastName: req.body.lName,
    email: req.body.email,
  };

  async function run() {
    try {
      const response = await mailchimp.lists.addListMember(listId, {
        email_address: subscribingUser.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: subscribingUser.firstName,
          LNAME: subscribingUser.lastName,
        },
      });

      res.sendFile(path.resolve(__dirname, 'success.html'));
    } catch (err) {
      res.sendFile(path.resolve(__dirname, 'failure.html'));
    }
  }

  run();
});

app.post('/failure', (req, res) => {
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server started listening at port ${port}`);
});
